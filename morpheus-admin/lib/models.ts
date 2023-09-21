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
    categories: any[];
    is_active: boolean;
    kind: string;
}

export interface ModelCategory {
    id?: string;
    name: string;
    description?: string;
}