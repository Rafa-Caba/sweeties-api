export type Size = {
    alto: number | null;
    ancho: number | null;
};

export type ItemDTO = {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    imagePublicId: string | null;
    materials: string[];
    size: Size[];
    sprites: string[];
    spritesPublicIds: string[];

    isFeatured: boolean;
    isVisible: boolean;

    // Optional “virtuals” to match your Spring DTO helpers
    info?: string;
    available?: boolean;
};