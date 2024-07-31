export function OptionalBoolean<T>(value: T): boolean | T {
    switch (value?.toString().toUpperCase()) {
        case 'TRUE':
            return true;
        case 'FALSE':
            return false;
        default:
            return value;
    }
}
