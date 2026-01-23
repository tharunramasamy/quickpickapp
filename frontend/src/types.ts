export interface Product {
    product_id: number;
    product_name: string;
    price: number;
    image_url: string;
    category: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}