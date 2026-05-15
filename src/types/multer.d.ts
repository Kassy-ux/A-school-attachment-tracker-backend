declare module "multer" {
  import { Request } from "express";
  const multer: any;
  export default multer;
  export function diskStorage(opts: any): any;
  export type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer?: Buffer;
      }
    }
    interface Request {
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
}

export {};
