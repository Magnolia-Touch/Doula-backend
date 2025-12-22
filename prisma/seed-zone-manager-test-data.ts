import {
    PrismaClient,
    Role,
    BookingStatus,
    ServiceStatus,
    MeetingStatus,
    WeekDays,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Zone Manager test data (schema-accurate)...');

    /**
     * 1️⃣ Zone Manager User (already exists)
     */
    const zmUser = await prisma.user.findUnique({
        where: { email: 'zonemanager@test.com' },
    });

    if (!zmUser) {
        throw new Error('zonemanager@test.com not found');
    }

    const zoneManager =
        (await prisma.zoneManagerProfile.findUnique({
            where: { userId: zmUser.id },
        })) ??
        (await prisma.zoneManagerProfile.create({
            data: { userId: zmUser.id },
        }));

    /**
     * 2️⃣ Region (required for bookings)
     */
    const region = await prisma.region.create({
        data: {
            regionName: 'Test Region',
            pincode: '603401',
            district: 'Test District',
            state: 'Test State',
            country: 'India',
            latitude: '12.97',
            longitude: '77.59',
            zoneManagerId: zoneManager.id,
        },
    });

    /**
     * 3️⃣ Client
     */
    const clientUser = await prisma.user.create({
        data: {
            name: 'Test Client',
            email: 'client1234@test.com',
            role: Role.CLIENT,
        },
    });

    const client = await prisma.clientProfile.create({
        data: {
            userId: clientUser.id,
            region: region.regionName,
        },
    });

    /**
     * 4️⃣ Doula under Zone Manager
     */
    const doulaUser = await prisma.user.create({
        data: {
            name: 'Test Doula',
            email: 'doula1234@test.com',
            role: Role.DOULA,
        },
    });

    const doula = await prisma.doulaProfile.create({
        data: {
            userId: doulaUser.id,
            zoneManager: {
                connect: { id: zoneManager.id },
            },
            Region: {
                connect: { id: region.id },
            },
        },
    });

    /**
     * 5️⃣ Service + Pricing (pricing belongs to Doula)
     */
    const service = await prisma.service.create({
        data: {
            name: 'Postnatal Care',
        },
    });

    const servicePricing = await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doula.id,
            price: 1500,
        },
    });

    /**
     * 6️⃣ Service Booking (for getBookedServiceById)
     */
    const booking = await prisma.serviceBooking.create({
        data: {
            clientId: client.id,
            doulaProfileId: doula.id,
            servicePricingId: servicePricing.id,
            regionId: region.id,
            startDate: new Date('2025-01-05'),
            endDate: new Date('2025-01-10'),
            status: BookingStatus.ACTIVE,
            paymentDetails: {},
        },
    });

    /**
     * 7️⃣ Schedule (for getScheduleById)
     */
    const schedule = await prisma.schedules.create({
        data: {
            date: new Date('2025-01-06'),
            startTime: new Date('2025-01-06T10:00:00'),
            endTime: new Date('2025-01-06T11:00:00'),
            status: ServiceStatus.IN_PROGRESS,
            doulaProfileId: doula.id,
            serviceId: servicePricing.id, // ⚠️ ServicePricing ID
            bookingId: booking.id,
            clientId: client.id,
        },
    });

    /**
     * 8️⃣ Meeting (for getMeetingById)
     */
    const meeting = await prisma.meetings.create({
        data: {
            link: 'https://meet.test/zone-manager',
            status: MeetingStatus.SCHEDULED,
            date: new Date('2025-01-02'),
            startTime: new Date('2025-01-02T09:00:00'),
            endTime: new Date('2025-01-02T09:30:00'),
            serviceName: service.name,
            bookedById: client.id,
            zoneManagerProfileId: zoneManager.id,
            doulaProfileId: doula.id,
            serviceId: service.id,
        },
    });

    console.log('✅ Seed completed successfully');
    console.log('🧪 TEST IDS');
    console.table({
        scheduleId: schedule.id,
        bookingId: booking.id,
        meetingId: meeting.id,
    });
}

main()
    .catch((e) => {
        console.error('❌ Seed failed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
