export class Refresher<Data> {
    private data: Data | undefined;
    private onChange: (data: Data) => void;
    private isEquivalent: (data1: Data, data2: Data) => boolean;
    constructor(
        onChange: (data: Data) => void,
        isEquivalent: (data1: Data, data2: Data) => boolean
    ) {
        this.data = undefined;
        this.onChange = onChange;
        this.isEquivalent = isEquivalent;
    }

    autorefresh(getData: () => Promise<Data>) {
        getData().then((newData) => {
            if (!this.data || !this.isEquivalent(this.data, newData)) {
                this.data = newData;
                this.onChange(newData);
            }

            setTimeout(() => {
                this.autorefresh(getData);
            }, 5000);
        });
    }
}