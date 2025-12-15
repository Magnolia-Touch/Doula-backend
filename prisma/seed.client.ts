import {
    PrismaClient,
    Role,
    BookingStatus,
    MeetingStatus,
    WeekDays,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding CLIENT test data…');

    /* =======================
       USER + CLIENT PROFILE
       ======================= */
    const clientUser = await prisma.user.upsert({
        where: { email: 'client1@test.com' },
        update: {},
        create: {
            name: 'Test Client',
            email: 'client1@test.com',
            phone: '9000000100',
            role: Role.CLIENT,
            clientProfile: {
                create: {
                    address: 'Test Client Address, Kochi',
                    region: 'Kochi',
                },
            },
        },
        include: { clientProfile: true },
    });

    const clientProfile = clientUser.clientProfile!;

    /* =======================
       DOULA USER + PROFILE
       ======================= */
    const doulaUser = await prisma.user.upsert({
        where: { email: 'doula1@test.com' },
        update: {},
        create: {
            name: 'Test Doula',
            email: 'doula1@test.com',
            phone: '9000000200',
            role: Role.DOULA,
            doulaProfile: {
                create: {
                    description: 'Experienced doula',
                    qualification: 'Certified',
                    yoe: 5,
                },
            },
        },
        include: { doulaProfile: true },
    });

    const doulaProfile = doulaUser.doulaProfile!;

    /* =======================
       REGION
       ======================= */
    const region = await prisma.region.upsert({
        where: { pincode: '682002' },
        update: {},
        create: {
            regionName: 'Kochi',
            pincode: '682002',
            district: 'Ernakulam',
            state: 'Kerala',
            country: 'India',
            latitude: '9.9312',
            longitude: '76.2673',
        },
    });

    await prisma.doulaProfile.update({
        where: { id: doulaProfile.id },
        data: {
            Region: { connect: { id: region.id } },
        },
    });

    /* =======================
       SERVICE + PRICING
       ======================= */
    const service = await prisma.service.create({
        data: {
            name: 'Doula Home Visit',
            description: 'Home care service',
        },
    });

    const pricing = await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doulaProfile.id,
            price: 2000,
        },
    });

    /* =======================
       SERVICE BOOKINGS
       ======================= */
    await prisma.serviceBooking.create({
        data: {
            clientId: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            regionId: region.id,
            servicePricingId: pricing.id,
            status: BookingStatus.ACTIVE,
            paymentDetails: { amount: 2000, method: 'UPI' },
        },
    });

    await prisma.serviceBooking.create({
        data: {
            clientId: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            regionId: region.id,
            servicePricingId: pricing.id,
            status: BookingStatus.CANCELED,
            cancelledAt: new Date(),
            paymentDetails: { amount: 2000, method: 'UPI' },
        },
    });

    /* =======================
       MEETING AVAILABILITY
       ======================= */
    const meetingDay = await prisma.availableSlotsForMeeting.upsert({
        where: {
            doulaId_weekday: {
                doulaId: doulaProfile.id,
                weekday: WeekDays.WEDNESDAY,
            },
        },
        update: {},
        create: {
            weekday: WeekDays.WEDNESDAY,
            ownerRole: Role.DOULA,
            doulaId: doulaProfile.id,
        },
    });

    await prisma.availableSlotsTimeForMeeting.create({
        data: {
            startTime: new Date('1970-01-01T10:00:00'),
            endTime: new Date('1970-01-01T11:00:00'),
            dateId: meetingDay.id,
            isBooked: true,
        },
    });

    /* =======================
       MEETINGS
       ======================= */
    await prisma.meetings.create({
        data: {
            link: 'https://meet.test/abc',
            status: MeetingStatus.SCHEDULED,
            date: new Date('2025-12-10'),
            startTime: new Date('1970-01-01T10:00:00'),
            endTime: new Date('1970-01-01T11:00:00'),
            serviceName: service.name,
            bookedById: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            availableSlotsForMeetingId: meetingDay.id,
            serviceId: service.id,
        },
    });

    await prisma.meetings.create({
        data: {
            link: 'https://meet.test/cancelled',
            status: MeetingStatus.CANCELED,
            cancelledAt: new Date(),
            date: new Date('2025-12-11'),
            startTime: new Date('1970-01-01T12:00:00'),
            endTime: new Date('1970-01-01T13:00:00'),
            serviceName: service.name,
            bookedById: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            availableSlotsForMeetingId: meetingDay.id,
            serviceId: service.id,
        },
    });

    console.log('✅ Client seed completed successfully');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
