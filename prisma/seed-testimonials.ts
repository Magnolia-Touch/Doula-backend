import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding testimonials for Zone Manager doulas...');

    /* -------------------------------
       1. FETCH ZONE MANAGER
    -------------------------------- */

    const zmUser = await prisma.user.findUnique({
        where: { email: 'zonemanager@test.com' },
        include: { zonemanagerprofile: true },
    });

    if (!zmUser?.zonemanagerprofile) {
        throw new Error('❌ Zone Manager not found');
    }

    const zoneManager = zmUser.zonemanagerprofile;

    /* -------------------------------
       2. FETCH DOULAS UNDER ZM
    -------------------------------- */

    const doulas = await prisma.doulaProfile.findMany({
        where: {
            zoneManager: {
                some: { id: zoneManager.id },
            },
            user: {
                email: {
                    in: ['doula@test.com', 'manju@gmail.com'],
                },
            },
        },
        include: { user: true },
    });

    if (!doulas.length) {
        throw new Error('❌ No matching doulas found under Zone Manager');
    }

    /* -------------------------------
       3. FETCH CLIENT
    -------------------------------- */

    const client = await prisma.clientProfile.findFirst({
        include: { user: true },
    });

    if (!client) {
        throw new Error('❌ Client not found');
    }

    /* -------------------------------
       4. CREATE TESTIMONIALS
    -------------------------------- */

    for (const doula of doulas) {
        const pricing = await prisma.servicePricing.findFirst({
            where: {
                doulaProfileId: doula.id,
            },
            include: { service: true },
        });

        if (!pricing) {
            console.warn(`⚠️ No ServicePricing for ${doula.user.name}`);
            continue;
        }

        const exists = await prisma.testimonials.findFirst({
            where: {
                doulaProfileId: doula.id,
                clientId: client.id,
                serviceId: pricing.id,
            },
        });

        if (exists) {
            console.log(`ℹ️ Testimonial already exists for ${doula.user.name}`);
            continue;
        }

        await prisma.testimonials.create({
            data: {
                doulaProfileId: doula.id,
                clientId: client.id,
                serviceId: pricing.id,
                ratings: Math.floor(Math.random() * 2) + 4, // 4 or 5
                reviews: `Excellent service by ${doula.user.name}. Highly recommended.`,
            },
        });

        console.log(`✅ Testimonial added for ${doula.user.name}`);
    }

    console.log('🎉 Testimonials seeding completed');
}

main()
    .catch((e) => {
        console.error('❌ Seeder failed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
