
export default function CreateBlock() {
    return (
        <main className="grid grid-cols-1 grid-cols-5 gap-4">
            <div className="col-span-3">
                <div className="overflow-hidden rounded-xl border border-line bg-surface">
                    <div className="border-b border-line bg-surface-soft px-4 py-2 font-mono text-xs text-muted">conv_block.py</div>
                    <div className="min-h-[320px] p-4">{/* CodeMirror goes here */}</div>
                </div>
            </div>
            <div className="col-span-2"> Param setter</div>
        </main>

    )
}