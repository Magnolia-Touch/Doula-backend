import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding missing tables…');

    /* =========================
       FETCH EXISTING ENTITIES
    ========================= */

    const admin = await prisma.adminProfile.findFirst();
    const zoneManager = await prisma.zoneManagerProfile.findFirst();
    const doula = await prisma.doulaProfile.findFirst();
    const client = await prisma.clientProfile.findFirst();

    if (!admin || !zoneManager || !doula || !client) {
        throw new Error('Required base profiles not found');
    }

    const region = await prisma.region.findFirst({
        where: { zoneManagerId: zoneManager.id },
    });

    const pricing = await prisma.servicePricing.findFirst({
        where: { doulaProfileId: doula.id },
    });

    if (!region || !pricing) {
        throw new Error('Region or ServicePricing missing');
    }

    /* =========================
       NOTES (ADMIN + ZM)
    ========================= */

    await prisma.notes.createMany({
        data: [
            {
                remarks: 'Admin internal note for testing',
                adminId: admin.id,
            },
            {
                remarks: 'Zone manager observation note',
                zoneManagerId: zoneManager.id,
            },
        ],
    });

    /* =========================
       ENQUIRY FORM
    ========================= */

    const meetingSlot = await prisma.availableSlotsForMeeting.findFirst({
        where: { doulaId: doula.id },
    });

    if (meetingSlot) {
        await prisma.enquiryForm.create({
            data: {
                name: 'Enquiry User',
                email: 'enquiry@test.com',
                phone: '9000000999',
                meetingsDate: new Date(),
                meetingsTimeSlots: '10:00–11:00',
                seviceStartDate: new Date(),
                serviceEndDate: new Date(),
                VisitFrequency: 3,
                serviceTimeSlots: 'Morning',
                serviceName: 'Doula Consultation',
                regionId: region.id,
                slotId: meetingSlot.id,
                serviceId: pricing.serviceId,
                clientId: client.id,
            },
        });
    }

    /* =========================
       INTAKE FORM
    ========================= */

    await prisma.intakeForm.create({
        data: {
            startDate: new Date(),
            endDate: new Date(),
            location: 'Client Home',
            address: 'Client temporary address',
            regionId: region.id,
            servicePricingId: pricing.id,
            doulaProfileId: doula.id,
            clientId: client.id,
        },
    });

    /* =========================
       NOTIFICATIONS
    ========================= */

    await prisma.notification.createMany({
        data: [
            {
                userId: client.userId,
                title: 'Booking Confirmed',
                body: 'Your service booking is confirmed.',
            },
            {
                userId: doula.userId,
                title: 'New Client Assigned',
                body: 'A new client has been assigned to you.',
            },
        ],
    });

    /* =========================
       DEVICE TOKENS
    ========================= */

    await prisma.deviceToken.createMany({
        data: [
            {
                userId: client.userId,
                token: 'test-device-token-client',
            },
            {
                userId: doula.userId,
                token: 'test-device-token-doula',
            },
        ],
        skipDuplicates: true,
    });

    /* =========================
       DOULA GALLERY
    ========================= */

    await prisma.doulaGallery.createMany({
        data: [
            {
                doulaProfileId: doula.id,
                url: 'https://cdn.test/gallery/1.jpg',
            },
            {
                doulaProfileId: doula.id,
                url: 'https://cdn.test/gallery/2.jpg',
            },
        ],
    });

    console.log('✅ Missing tables seeded successfully');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
