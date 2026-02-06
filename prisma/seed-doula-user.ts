import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding doula user bambini@test.com...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: 'bambini@test.com' },
    });

    if (existingUser) {
        console.log('⚠️  User bambini@test.com already exists. Skipping...');
        return;
    }

    // Find a region to assign to the doula
    const region = await prisma.region.findFirst({
        where: { is_active: true },
    });

    if (!region) {
        throw new Error('No active region found. Please seed regions first.');
    }

    // Find zone manager for the region (if exists)
    const zoneManager = region.zoneManagerId
        ? await prisma.zoneManagerProfile.findUnique({
            where: { id: region.zoneManagerId },
        })
        : null;

    // Create the user with doula profile
    const user = await prisma.user.create({
        data: {
            name: 'Bambini Test Doula',
            email: 'bambini@test.com',
            phone: '+1234567890',
            role: Role.DOULA,
            is_active: true,
            otp: '123456', // Preset OTP for testing
            otpExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year for testing
            doulaProfile: {
                create: {
                    description: 'Experienced doula providing compassionate care for expecting mothers.',
                    qualification: 'Certified Birth Doula, Postpartum Care Specialist',
                    achievements: 'Supported over 100 births, Member of DONA International',
                    yoe: 5,
                    languages: ['English', 'Spanish'],
                    specialities: ['Birth Support', 'Postpartum Care', 'Breastfeeding Support'],
                    profile_image: null,
                    Region: {
                        connect: { id: region.id },
                    },
                    ...(zoneManager && {
                        zoneManager: {
                            connect: { id: zoneManager.id },
                        },
                    }),
                },
            },
        },
        include: {
            doulaProfile: {
                include: {
                    Region: true,
                },
            },
        },
    });

    console.log('✅ Doula user created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   OTP: 123456 (preset for testing)`);
    console.log(`   Profile ID: ${user.doulaProfile?.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding doula user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
