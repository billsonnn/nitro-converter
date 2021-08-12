export interface IConverter
{
    convertAsync(args?: string[]): Promise<void>;
}
