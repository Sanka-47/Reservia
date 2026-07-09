export declare class ColumnNumericTransformer {
    to(data: number | null): number | null;
    from(data: string | null): number | null;
}
export declare class Service {
    id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
