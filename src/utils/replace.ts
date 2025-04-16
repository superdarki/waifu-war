export const compile = (str:string, args: Record<string, string>) => {
    Object.entries(args).forEach(([k,v]) => {
        str = str.replace(`{{${k}}}`,v)
    })
    return str
}