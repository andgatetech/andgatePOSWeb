export type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray;

type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

const appendClassNames = (input: ClassValue, output: string[]) => {
    if (!input) return;

    if (typeof input === 'string' || typeof input === 'number') {
        output.push(String(input));
        return;
    }

    if (Array.isArray(input)) {
        input.forEach((value) => appendClassNames(value, output));
        return;
    }

    if (typeof input === 'object') {
        Object.entries(input).forEach(([key, value]) => {
            if (value) output.push(key);
        });
    }
};

export function cn(...inputs: ClassValue[]) {
    const classes: string[] = [];
    inputs.forEach((input) => appendClassNames(input, classes));
    return classes.join(' ');
}
