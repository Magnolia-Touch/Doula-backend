// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//     /**
//      * 1. Fetch the doula user
//      */
//     const doulaUser = await prisma.user.findUnique({
//         where: { email: 'doula@test.com' },
//         include: { doulaProfile: true },
//     });

//     if (!doulaUser || !doulaUser.doulaProfile) {
//         throw new Error('Doula profile not found for doula@test.com');
//     }

//     const doulaProfileId = doulaUser.doulaProfile.id;

//     /**
//      * 2. Fetch services offered by this doula
//      */
//     const services = await prisma.servicePricing.findMany({
//         where: { doulaProfileId },
//     });

//     if (!services.length) {
//         throw new Error('No services found for this doula');
//     }

//     /**
//      * 3. Fetch verified clients
//      */
//     const clients = await prisma.clientProfile.findMany({
//         take: 3,
//     });

//     if (!clients.length) {
//         throw new Error('No clients found to create testimonials');
//     }

//     /**
//      * 4. Prepare testimonial data
//      */
//     const testimonialsData = [
//         {
//             ratings: 5,
//             reviews:
//                 'Exceptional care and emotional support throughout the journey. Highly recommended.',
//         },
//         {
//             ratings: 4,
//             reviews:
//                 'Very professional and compassionate. Made us feel confident and relaxed.',
//         },
//         {
//             ratings: 5,
//             reviews:
//                 'Outstanding experience. Clear communication and genuine care.',
//         },
//     ];

//     /**
//      * 5. Create testimonials
//      */
//     for (let i = 0; i < testimonialsData.length; i++) {
//         await prisma.testimonials.create({
//             data: {
//                 doulaProfileId,
//                 serviceId: services[i % services.length].id,
//                 clientId: clients[i % clients.length].id,
//                 ratings: testimonialsData[i].ratings,
//                 reviews: testimonialsData[i].reviews,
//             },
//         });
//     }

//     console.log('Testimonials seeded successfully');
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });






import {
    PrismaClient,
    Role,
    ServiceStatus,
    BookingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const toDate = (d: string) => new Date(d);

const RANGE_DATES = [
    '2026-02-10',
    '2026-02-11',
    '2026-02-12',
    '2026-02-13',
    '2026-02-14',
    '2026-02-15',
];

async function createDoula(name: string) {
    const user = await prisma.user.upsert({
        where: {
            email: `${name.toLowerCase()}@test.com`,
        },
        update: {},
        create: {
            name,
            email: `${name.toLowerCase()}@test.com`,
            role: Role.DOULA,
            is_active: true,
            doulaProfile: {
                create: {},
            },
        },
        include: { doulaProfile: true },
    });


    return user.doulaProfile!.id;
}

async function addAvailableSlots(
    doulaId: string,
    slotDates: string[],
) {
    for (const d of slotDates) {
        await prisma.availableSlotsForService.create({
            data: {
                doulaId,
                date: toDate(d),
                availability: {
                    morning: true,
                    night: true,
                    fullday: true,
                },
            },
        });
    }
}

async function addSchedules(
    doulaId: string,
    bookedDates: string[],
    servicePricingId: string,
    clientId: string,
    bookingId: string,
) {
    for (const d of bookedDates) {
        await prisma.schedules.create({
            data: {
                doulaProfileId: doulaId,
                date: toDate(d),
                status: ServiceStatus.PENDING,
                serviceId: servicePricingId,
                clientId,
                bookingId,
            },
        });
    }
}

async function main() {
    console.log('Seeding started...');

    /* ---------------------------------------------------
       1️⃣ Create Region (required for booking)
    --------------------------------------------------- */
    const region = await prisma.region.upsert({
        where: {
            pincode: '695001',
        },
        update: {},
        create: {
            regionName: 'Test Region',
            pincode: '695001',
            district: 'TVM',
            state: 'Kerala',
            country: 'India',
            latitude: '0',
            longitude: '0',
        },
    });


    /* ---------------------------------------------------
       2️⃣ Create Service
    --------------------------------------------------- */
    const service = await prisma.service.create({
        data: {
            name: 'Postnatal Care',
        },
    });

    /* ---------------------------------------------------
       3️⃣ Create Client
    --------------------------------------------------- */
    const clientUser = await prisma.user.create({
        data: {
            name: 'Test Client',
            email: 'client@test.com',
            role: Role.CLIENT,
            clientProfile: {
                create: {},
            },
        },
        include: { clientProfile: true },
    });

    const clientId = clientUser.clientProfile!.id;

    /* ---------------------------------------------------
       4️⃣ DOULA A (partially booked)
    --------------------------------------------------- */
    const doulaA = await createDoula('DoulaA');

    const pricingA = await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doulaA,
            price: { fullday: 1000 },
        },
    });

    const bookingA = await prisma.serviceBooking.create({
        data: {
            doulaProfileId: doulaA,
            clientId,
            servicePricingId: pricingA.id,
            regionId: region.id,
            status: BookingStatus.PENDING,
        },
    });

    await addAvailableSlots(doulaA, RANGE_DATES);

    await addSchedules(
        doulaA,
        ['2026-02-11', '2026-02-13'],
        pricingA.id,
        clientId,
        bookingA.id,
    );

    /* ---------------------------------------------------
       5️⃣ DOULA B (fully booked)
    --------------------------------------------------- */
    const doulaB = await createDoula('DoulaB');

    const pricingB = await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doulaB,
            price: { fullday: 1200 },
        },
    });

    const bookingB = await prisma.serviceBooking.create({
        data: {
            doulaProfileId: doulaB,
            clientId,
            servicePricingId: pricingB.id,
            regionId: region.id,
            status: BookingStatus.PENDING,
        },
    });

    await addAvailableSlots(doulaB, [
        '2026-02-10',
        '2026-02-11',
    ]);

    await addSchedules(
        doulaB,
        ['2026-02-10', '2026-02-11'],
        pricingB.id,
        clientId,
        bookingB.id,
    );

    /* ---------------------------------------------------
       6️⃣ DOULA C (no slots in range)
    --------------------------------------------------- */
    const doulaC = await createDoula('DoulaC');

    await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doulaC,
            price: { fullday: 900 },
        },
    });

    await addAvailableSlots(doulaC, ['2026-03-01']);

    /* ---------------------------------------------------
       7️⃣ DOULA D (fully available)
    --------------------------------------------------- */
    const doulaD = await createDoula('DoulaD');

    await prisma.servicePricing.create({
        data: {
            serviceId: service.id,
            doulaProfileId: doulaD,
            price: { fullday: 1500 },
        },
    });

    await addAvailableSlots(doulaD, [
        '2026-02-12',
        '2026-02-13',
        '2026-02-14',
    ]);

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
