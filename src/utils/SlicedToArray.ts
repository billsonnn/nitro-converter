export class SlicedToArray
{
    public static slicedToArray(arr: any, i: any): any[]
    {
        if(Array.isArray(arr)) return arr;

        if(Symbol.iterator in Object(arr)) return SlicedToArray.sliceIterator(arr, i);
        
        throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }

    private static sliceIterator(arr: any, i: any): any[]
    {
        const _arr = [];

        let _n = true;
        let _d = false;
        let _e = undefined;

        try
        {
            for(var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true)
            {
                _arr.push(_s.value);

                if(i && _arr.length === i) break;
            }
        }

        catch (err)
        {
            _d = true;
            _e = err;
        }

        finally
        {
            try
            {
                if(!_n && _i['return']) _i['return']();
            }

            finally
            {
                if(_d) throw _e;
            }
        }

        return _arr;
    }
}
