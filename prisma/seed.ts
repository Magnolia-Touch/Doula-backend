import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding testimonials...');

    const doula = await prisma.doulaProfile.findFirst({
        include: {
            ServicePricing: true,
        },
    });

    if (!doula || doula.ServicePricing.length === 0) {
        throw new Error('No doula or service pricing found. Seed base data first.');
    }

    const client = await prisma.clientProfile.findFirst();
    if (!client) {
        throw new Error('No client found. Seed client first.');
    }

    const servicePricing = doula.ServicePricing[0];

    // Cleanup old test testimonials
    await prisma.testimonials.deleteMany({
        where: {
            reviews: {
                contains: '[TEST]',
            },
        },
    });

    const testimonialsData = [
        {
            doulaProfileId: doula.id,
            serviceId: servicePricing.id,
            clientId: client.id,
            ratings: 5,
            reviews: '[TEST] Excellent care and emotional support',
            createdAt: new Date('2025-01-05'),
        },
        {
            doulaProfileId: doula.id,
            serviceId: servicePricing.id,
            clientId: client.id,
            ratings: 4,
            reviews: '[TEST] Very professional and punctual',
            createdAt: new Date('2025-01-10'),
        },
        {
            doulaProfileId: doula.id,
            serviceId: servicePricing.id,
            clientId: client.id,
            ratings: 3,
            reviews: '[TEST] Good experience overall',
            createdAt: new Date('2025-02-01'),
        },
    ];

    await prisma.testimonials.createMany({
        data: testimonialsData,
    });

    console.log('✅ Testimonials seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
