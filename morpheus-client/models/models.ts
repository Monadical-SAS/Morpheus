export interface UserRegistration {
  name?: string;
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  phone?: string;
  is_active: boolean;
}

export interface UserFirebase {
  displayName?: string | null;
  email: string;
  phoneNumber: string;
  photoURL: string;
}

export interface Collection {
  id?: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  collaborators?: string[];
}

export interface Prompt {
  prompt: string;
  model: string;
  sampler: string;
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
  num_images_per_prompt: number;
  generator: number;
  strength: number;
  negative_prompt: string;
}

export interface ArtWork {
  id?: string;
  title?: string;
  image: string;
  prompt?: Prompt;
  collection_id?: string;
  isSelected?: boolean;
}

export interface Model {
  id?: string;
  name: string;
  source?: string;
  description?: string;
  is_active: boolean;
  url_docs?: string;
  text2img?: boolean;
  img2img?: boolean;
  inpainting?: boolean;
  controlnet?: boolean;
  pix2pix?: boolean;
}

export interface ControlNetModel extends Model {
  type?: string;
}

export interface Sampler {
  id?: string;
  name: string;
  description?: string;
}

export interface Response {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
