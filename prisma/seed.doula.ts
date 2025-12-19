import {
    PrismaClient,
    Role,
    WeekDays,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding data for Doula API testing (doula@test.com)…');

    /* =========================
       FETCH DOULA
    ========================= */

    const doulaUser = await prisma.user.findUnique({
        where: { email: 'doula@test.com' },
        include: { doulaProfile: true },
    });

    if (!doulaUser || !doulaUser.doulaProfile) {
        throw new Error('❌ doula@test.com not found');
    }

    const doula = doulaUser.doulaProfile;

    /* =========================
       FETCH CLIENT
    ========================= */

    const clientUser = await prisma.user.findFirst({
        where: { role: Role.CLIENT },
        include: { clientProfile: true },
    });

    if (!clientUser || !clientUser.clientProfile) {
        throw new Error('❌ No client found for testimonials');
    }

    const client = clientUser.clientProfile;

    /* =========================
       SERVICE & PRICING
    ========================= */

    let service = await prisma.service.findFirst({
        where: { name: 'Postnatal Care' },
    });

    if (!service) {
        service = await prisma.service.create({
            data: {
                name: 'Postnatal Care',
                description: 'Postnatal care and follow-up',
            },
        });
    }


    let pricing = await prisma.servicePricing.findFirst({
        where: {
            serviceId: service.id,
            doulaProfileId: doula.id,
        },
    });

    if (!pricing) {
        pricing = await prisma.servicePricing.create({
            data: {
                serviceId: service.id,
                doulaProfileId: doula.id,
                price: 1800,
            },
        });
    }


    /* =========================
       AVAILABLE SLOTS (SERVICE)
    ========================= */

    const weekdays: WeekDays[] = [
        WeekDays.MONDAY,
        WeekDays.WEDNESDAY,
        WeekDays.FRIDAY,
    ];

    for (const day of weekdays) {
        const slotDay = await prisma.availableSlotsForService.upsert({
            where: {
                doulaId_weekday: {
                    doulaId: doula.id,
                    weekday: day,
                },
            },
            update: {},
            create: {
                doulaId: doula.id,
                weekday: day,
                availabe: true,
            },
        });

        await prisma.availableSlotsTimeForService.createMany({
            data: [
                {
                    startTime: new Date('1970-01-01T09:00:00'),
                    endTime: new Date('1970-01-01T10:00:00'),
                    dateId: slotDay.id,
                },
                {
                    startTime: new Date('1970-01-01T10:00:00'),
                    endTime: new Date('1970-01-01T11:00:00'),
                    dateId: slotDay.id,
                },
            ],
            skipDuplicates: true,
        });
    }

    /* =========================
       TESTIMONIALS
    ========================= */

    await prisma.testimonials.createMany({
        data: [
            {
                doulaProfileId: doula.id,
                serviceId: pricing.id,
                clientId: client.id,
                ratings: 5,
                reviews: 'Excellent care and very supportive.',
            },
            {
                doulaProfileId: doula.id,
                serviceId: pricing.id,
                clientId: client.id,
                ratings: 4,
                reviews: 'Very professional and kind.',
            },
            {
                doulaProfileId: doula.id,
                serviceId: pricing.id,
                clientId: client.id,
                ratings: 5,
                reviews: 'Highly recommend this doula.',
            },
        ],
    });

    console.log('✅ Doula API test data seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
