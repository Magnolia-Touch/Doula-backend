import {
    PrismaClient,
    Role,
    BookingStatus,
    MeetingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding CLIENT test data…');

    /* =======================
       USER + CLIENT PROFILE
       ======================= */
    const clientUser = await prisma.user.create({
        data: {
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
    const doulaUser = await prisma.user.create({
        data: {
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
    const region = await prisma.region.create({
        data: {
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
       SERVICE BOOKING (ACTIVE)
       ======================= */
    const serviceBooking = await prisma.serviceBooking.create({
        data: {
            clientId: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            regionId: region.id,
            servicePricingId: pricing.id,
            status: BookingStatus.ACTIVE,
            paymentDetails: {
                amount: 2000,
                method: 'UPI',
            },
        },
    });

    /* =======================
       SERVICE BOOKING (CANCELED)
       ======================= */
    await prisma.serviceBooking.create({
        data: {
            clientId: clientProfile.id,
            doulaProfileId: doulaProfile.id,
            regionId: region.id,
            servicePricingId: pricing.id,
            status: BookingStatus.CANCELED,
            cancelledAt: new Date(),
            paymentDetails: {
                amount: 2000,
                method: 'UPI',
            },
        },
    });

    /* =======================
       MEETING SLOT
       ======================= */
    const meetingDay = await prisma.availableSlotsForMeeting.create({
        data: {
            date: new Date('2025-12-10'),
            weekday: 'Wednesday',
            ownerRole: Role.DOULA,
            doulaId: doulaProfile.id,
        },
    });

    const meetingSlot = await prisma.availableSlotsTimeForMeeting.create({
        data: {
            startTime: new Date('2025-12-10T10:00:00'),
            endTime: new Date('2025-12-10T11:00:00'),
            dateId: meetingDay.id,
            isBooked: true,
        },
    });

    /* =======================
       MEETING (SCHEDULED)
       ======================= */
    await prisma.meetings.create({
        data: {
            link: 'https://meet.test/abc',
            status: MeetingStatus.SCHEDULED,
            bookedById: clientProfile.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doulaProfile.id,
            serviceId: service.id,
        },
    });

    /* =======================
       MEETING (CANCELED)
       ======================= */
    await prisma.meetings.create({
        data: {
            link: 'https://meet.test/cancelled',
            status: MeetingStatus.CANCELED,
            cancelledAt: new Date(),
            bookedById: clientProfile.id,
            slotId: (await prisma.availableSlotsTimeForMeeting.create({
                data: {
                    startTime: new Date('2025-12-11T12:00:00'),
                    endTime: new Date('2025-12-11T13:00:00'),
                    dateId: meetingDay.id,
                },
            })).id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doulaProfile.id,
            serviceId: service.id,
        },
    });

    console.log('✅ Client seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
