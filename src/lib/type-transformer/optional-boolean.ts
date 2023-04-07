// eslint-disable-next-line @typescript-eslint/naming-convention
export function OptionalBoolean(value: any) {
    switch (value?.toString().toUpperCase()) {
        case 'TRUE':
            return true;
        case 'FALSE':
            return false;
        default:
            return value;
    }
}
