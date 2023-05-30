export class Layer {

    static KB = 1024
    static MB = 1024 * Layer.KB
    static GB = 1024 * Layer.MB

    readonly command: string
    readonly instruction: string

    constructor(instructionString: string, readonly size: number) {
        let cleanedInstructions = instructionString
            .replace("/bin/sh -c #(nop) ", "")
            .replace("RUN /bin/sh -c", "RUN")
            .replace("/bin/sh -c", "RUN")
            .trim()
        let parts = cleanedInstructions.split(" ");
        if (parts.length == 0) {//no spaces? 
            throw new Error("Unsupported Layer: '" + instructionString + "'")
        }
        this.command = parts[0]
        this.instruction = parts.slice(1).join(" ")
    }

    getCompressedSizeString(): string {
        if (this.size < Layer.KB) {
            return this.size.toFixed(2) + " B"
        }
        if (this.size < Layer.MB) {
            return (this.size / Layer.KB).toFixed(2) + " KB"
        }
        if (this.size < Layer.GB) {
            return (this.size / Layer.MB).toFixed(2) + " MB"
        }
        return (this.size / Layer.GB).toFixed(2) + " GB"
    }

    getInstructionCropped(threshold: number): string {
        if (this.instruction.length < threshold) {
            return this.instruction;
        }
        return this.instruction.substring(0, threshold)+" ... ";
    }
}
