// 👇 Questo dice a TypeScript di accettare il modulo papaparse anche senza tipi
declare module "papaparse" {
  const Papa: any;
  export default Papa;
}
