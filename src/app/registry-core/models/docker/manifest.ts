import { ListItem } from "./list-item"

export interface Manifest {
    mediaType: string
    schemaVersion: number
    config: ListItem
    layers: Array<ListItem>
}
