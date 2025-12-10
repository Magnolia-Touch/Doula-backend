"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const pregnancy = await prisma.service.create({
        data: {
            name: 'Pregnancy Care',
        },
    });
    const postpartum = await prisma.service.create({
        data: {
            name: 'Postpartum Care',
        },
    });
    const chennai = await prisma.region.create({
        data: {
            regionName: 'Chennai',
            pincode: '600001',
            district: 'Chennai',
            state: 'TN',
            country: 'India',
            latitude: '13.0827',
            longitude: '80.2707',
        }
    });
    const bangalore = await prisma.region.create({
        data: {
            regionName: 'Bangalore',
            pincode: '560001',
            district: 'Bangalore',
            state: 'KA',
            country: 'India',
            latitude: '12.9716',
            longitude: '77.5946',
        }
    });
    const doula1 = await prisma.user.create({
        data: {
            name: 'Doula One',
            email: 'doula1@example.com',
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: null,
                    description: 'I help mothers through pregnancy journey',
                    achievements: 'Certified doula, 5 years experience',
                    qualification: 'BSc Nursing',
                    yoe: 5,
                    Region: {
                        connect: { id: chennai.id }
                    },
                },
            },
        },
        include: { doulaProfile: true }
    });
    const doula2 = await prisma.user.create({
        data: {
            name: 'Doula Two',
            email: 'doula2@example.com',
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: null,
                    description: 'Specialised in postpartum recovery',
                    achievements: 'Multiple certifications',
                    qualification: 'Diploma Nursing',
                    yoe: 3,
                    Region: {
                        connect: { id: bangalore.id }
                    },
                },
            },
        },
        include: { doulaProfile: true }
    });
    const doula3 = await prisma.user.create({
        data: {
            name: 'Doula Three',
            email: 'doula3@example.com',
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: null,
                    description: 'Holistic care and nutrition assistance',
                    achievements: 'Yoga certified, lactation support',
                    qualification: 'BSc Nursing',
                    yoe: 7,
                    Region: {
                        connect: { id: chennai.id }
                    },
                },
            },
        },
        include: { doulaProfile: true }
    });
    await prisma.servicePricing.createMany({
        data: [
            {
                doulaProfileId: doula1.doulaProfile.id,
                serviceId: pregnancy.id,
                price: 5000.00
            },
            {
                doulaProfileId: doula1.doulaProfile.id,
                serviceId: postpartum.id,
                price: 4000.00
            },
            {
                doulaProfileId: doula2.doulaProfile.id,
                serviceId: postpartum.id,
                price: 3500.00
            },
            {
                doulaProfileId: doula3.doulaProfile.id,
                serviceId: pregnancy.id,
                price: 6000.00
            }
        ]
    });
    const client = await prisma.user.create({
        data: {
            name: "Client One",
            email: "client1@example.com",
            role: client_1.Role.CLIENT,
            clientProfile: { create: {} }
        },
        include: { clientProfile: true }
    });
    await prisma.testimonials.createMany({
        data: [
            {
                doulaProfileId: doula1.doulaProfile.id,
                serviceId: pregnancy.id,
                ratings: 5,
                reviews: "Excellent support and very knowledgeable",
                clientId: client.clientProfile.id,
            },
            {
                doulaProfileId: doula1.doulaProfile.id,
                serviceId: postpartum.id,
                ratings: 4,
                reviews: "Very helpful during postpartum",
                clientId: client.clientProfile.id,
            },
            {
                doulaProfileId: doula2.doulaProfile.id,
                serviceId: postpartum.id,
                ratings: 4,
                reviews: "Good care and guidance",
                clientId: client.clientProfile.id,
            }
        ]
    });
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    await prisma.availableSlotsForService.createMany({
        data: [
            {
                doulaId: doula1.doulaProfile.id,
                date: today,
                weekday: 'Monday',
            },
            {
                doulaId: doula1.doulaProfile.id,
                date: tomorrow,
                weekday: 'Tuesday',
            },
            {
                doulaId: doula2.doulaProfile.id,
                date: tomorrow,
                weekday: 'Tuesday',
            },
        ]
    });
    console.log('Seed completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => prisma.$disconnect());
//# sourceMappingURL=seed.js.map