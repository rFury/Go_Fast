import { HttpContext, HttpContextToken } from '@angular/common/http';
import { LoaderType } from '../../Services/loader.service';

export const LOADER_TYPE = new HttpContextToken<LoaderType>(() => 'global');
export const setLoaderType = (type: string) => new HttpContext().set(LOADER_TYPE, type);