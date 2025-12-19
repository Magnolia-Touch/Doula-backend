import {
    PrismaClient,
    Role,
    WeekDays,
    MeetingStatus,
    BookingStatus,
    ServiceStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

function utcToday() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function addUtcDays(days: number) {
    const d = utcToday();
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

async function main() {
    console.log('🌱 Seeding VPS-safe data for doula@test.com');

    /* =========================
       FETCH DOULA
    ========================= */

    const doulaUser = await prisma.user.findUnique({
        where: { email: 'doula@test.com' },
        include: { doulaProfile: true },
    });

    if (!doulaUser?.doulaProfile) {
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

    if (!clientUser?.clientProfile) {
        throw new Error('❌ Client not found');
    }

    const client = clientUser.clientProfile;

    /* =========================
       SERVICE
    ========================= */

    let service = await prisma.service.findFirst({
        where: { name: 'Postnatal Care' },
    });

    if (!service) {
        service = await prisma.service.create({
            data: {
                name: 'Postnatal Care',
                description: 'Postnatal care and support',
            },
        });
    }

    /* =========================
       SERVICE PRICING
    ========================= */

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

    const weekdays = [
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
                    startTime: new Date('1970-01-01T09:00:00Z'),
                    endTime: new Date('1970-01-01T10:00:00Z'),
                    dateId: slotDay.id,
                },
                {
                    startTime: new Date('1970-01-01T10:00:00Z'),
                    endTime: new Date('1970-01-01T11:00:00Z'),
                    dateId: slotDay.id,
                },
            ],
            skipDuplicates: true,
        });
    }

    /* =========================
       MEETINGS (FUTURE – IMMEDIATE)
    ========================= */

    const meetingDate = addUtcDays(1); // tomorrow (guaranteed future)

    await prisma.meetings.create({
        data: {
            link: 'https://meet.test/immediate',
            status: MeetingStatus.SCHEDULED,
            date: meetingDate,
            startTime: new Date('1970-01-01T10:00:00Z'),
            endTime: new Date('1970-01-01T11:00:00Z'),
            serviceName: service.name,
            bookedById: client.id,
            doulaProfileId: doula.id,
            serviceId: service.id,
        },
    });

    /* =========================
       SCHEDULES (FUTURE)
    ========================= */

    await prisma.schedules.create({
        data: {
            date: addUtcDays(2),
            startTime: new Date('1970-01-01T09:00:00Z'),
            endTime: new Date('1970-01-01T10:00:00Z'),
            doulaProfileId: doula.id,
            serviceId: pricing.id,
            clientId: client.id,
            status: ServiceStatus.PENDING,
        },
    });

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
                reviews: 'Outstanding care and support.',
            },
            {
                doulaProfileId: doula.id,
                serviceId: pricing.id,
                clientId: client.id,
                ratings: 4,
                reviews: 'Very professional and helpful.',
            },
        ],
    });

    console.log('✅ VPS-safe Doula seed completed successfully');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
