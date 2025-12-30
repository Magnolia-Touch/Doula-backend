import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    /**
     * 1. Fetch the doula user
     */
    const doulaUser = await prisma.user.findUnique({
        where: { email: 'doula@test.com' },
        include: { doulaProfile: true },
    });

    if (!doulaUser || !doulaUser.doulaProfile) {
        throw new Error('Doula profile not found for doula@test.com');
    }

    const doulaProfileId = doulaUser.doulaProfile.id;

    /**
     * 2. Fetch services offered by this doula
     */
    const services = await prisma.servicePricing.findMany({
        where: { doulaProfileId },
    });

    if (!services.length) {
        throw new Error('No services found for this doula');
    }

    /**
     * 3. Fetch verified clients
     */
    const clients = await prisma.clientProfile.findMany({
        take: 3,
    });

    if (!clients.length) {
        throw new Error('No clients found to create testimonials');
    }

    /**
     * 4. Prepare testimonial data
     */
    const testimonialsData = [
        {
            ratings: 5,
            reviews:
                'Exceptional care and emotional support throughout the journey. Highly recommended.',
        },
        {
            ratings: 4,
            reviews:
                'Very professional and compassionate. Made us feel confident and relaxed.',
        },
        {
            ratings: 5,
            reviews:
                'Outstanding experience. Clear communication and genuine care.',
        },
    ];

    /**
     * 5. Create testimonials
     */
    for (let i = 0; i < testimonialsData.length; i++) {
        await prisma.testimonials.create({
            data: {
                doulaProfileId,
                serviceId: services[i % services.length].id,
                clientId: clients[i % clients.length].id,
                ratings: testimonialsData[i].ratings,
                reviews: testimonialsData[i].reviews,
            },
        });
    }

    console.log('Testimonials seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
