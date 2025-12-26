
export type TimeInput = {
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
};

type ExistingSlot = {
    startTime: Date;
    endTime: Date;
};

function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function dateToMinutes(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function toHHMM(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Resolves availability overlap consistency
 */
// 1. if input1 startime less than input2 startime and input1 endtime less than input2 endtime, change input1 endtime value to input2 startime. 
// 2. if input1 starttime greater than input2 starttime and input1 endtime greater than input2 endtime, change input1 starttime value to input2 endtime 
// 3. if input1 starttime is greater than input2 startime and input1 endtime less than input2 endtime, return 0 
// 4. if input1 startime is less than input2 endtime and input1 endtime grater than input2 endtime, return 1
export function resolveAvailabilityOverlap(
    input: TimeInput,
    existingSlots: ExistingSlot[],
): TimeInput | 0 | 1 {

    let start = toMinutes(input.startTime);
    let end = toMinutes(input.endTime);

    for (const slot of existingSlots) {
        const s2 = dateToMinutes(slot.startTime);
        const e2 = dateToMinutes(slot.endTime);

        // ✅ Correct overlap detection
        const overlaps = start < e2 && end > s2;
        if (!overlaps) continue;

        // Rule 1: trim end
        if (start < s2 && end <= e2) {
            console.log("1")
            end = s2;
            continue;
        }

        // Rule 2: trim start
        if (start >= s2 && end > e2) {
            console.log("2")
            start = e2;
            continue;
        }

        // Rule 3: fully inside
        if (start >= s2 && end <= e2) {
            console.log("3")
            return 0;
        }

        // Rule 4: crosses both sides
        if (start < s2 && end > e2) {
            console.log("4")
            return 1;
        }
    }

    return {
        startTime: toHHMM(start),
        endTime: toHHMM(end),
    };
}
