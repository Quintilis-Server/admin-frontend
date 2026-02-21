export interface Category{
    id: string
    title: string
    slug: string
    description: string
    display_order: number
    created_at: Date
}
export interface Topic{
    id: string
    topic_id: string
    author_id: string;
}
export interface Post{

}
