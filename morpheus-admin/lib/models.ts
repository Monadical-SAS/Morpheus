export interface Response {
    success: boolean;
    data?: any;
    message?: string;
}

export interface Model {
    id?: string;
    name: string;
    source: string;
    description?: string;
    url_docs?: string;
    category: string;
    is_active: boolean;
}

export interface ModelCategory {
    id?: string;
    name: string;
    description?: string;
}