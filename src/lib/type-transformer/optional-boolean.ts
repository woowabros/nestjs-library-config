// eslint-disable-next-line @typescript-eslint/naming-convention
export function OptionalBoolean(value: string | number | boolean | undefined) {
    switch (value?.toString().toUpperCase()) {
        case 'TRUE':
            return true;
        case 'FALSE':
            return false;
        default:
            return value;
    }
}
