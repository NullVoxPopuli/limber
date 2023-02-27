var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _UrlCompression_worker;
export function getWorker() {
    return new Worker(new URL('./worker', import.meta.url));
}
export class UrlCompression {
    constructor({ onEncoded, onDecoded }) {
        _UrlCompression_worker.set(this, void 0);
        this.encode = (text) => __classPrivateFieldGet(this, _UrlCompression_worker, "f").postMessage({ action: 'encode', text });
        this.decode = (encoded) => __classPrivateFieldGet(this, _UrlCompression_worker, "f").postMessage({ action: 'encode', encoded });
        __classPrivateFieldSet(this, _UrlCompression_worker, getWorker(), "f");
        __classPrivateFieldGet(this, _UrlCompression_worker, "f").addEventListener('message', (event) => {
            let { encoded, decoded } = event.data;
            if (encoded) {
                return onEncoded(encoded);
            }
            if (decoded) {
                return onDecoded(decoded);
            }
        });
    }
}
_UrlCompression_worker = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQU9ELE1BQU0sT0FBTyxjQUFjO0lBR3pCLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFXO1FBRjdDLHlDQUFnQjtRQWtCaEIsV0FBTSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyx1QkFBQSxJQUFJLDhCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLFdBQU0sR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsdUJBQUEsSUFBSSw4QkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQWhCcEYsdUJBQUEsSUFBSSwwQkFBVyxTQUFTLEVBQUUsTUFBQSxDQUFDO1FBRTNCLHVCQUFBLElBQUksOEJBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNqRCxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFdEMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0I7WUFFRCxJQUFJLE9BQU8sRUFBRTtnQkFDWCxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUlGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtlcigpIHtcbiAgcmV0dXJuIG5ldyBXb3JrZXIobmV3IFVSTCgnLi93b3JrZXInLCBpbXBvcnQubWV0YS51cmwpKTtcbn1cblxuaW50ZXJmYWNlIE9wdGlvbnMge1xuICBvbkVuY29kZWQ6IChlbmNvZGVkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uRGVjb2RlZDogKGRlY29kZWQ6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFVybENvbXByZXNzaW9uIHtcbiAgI3dvcmtlcjogV29ya2VyO1xuXG4gIGNvbnN0cnVjdG9yKHsgb25FbmNvZGVkLCBvbkRlY29kZWQgfTogT3B0aW9ucykge1xuICAgIHRoaXMuI3dvcmtlciA9IGdldFdvcmtlcigpO1xuXG4gICAgdGhpcy4jd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGxldCB7IGVuY29kZWQsIGRlY29kZWQgfSA9IGV2ZW50LmRhdGE7XG5cbiAgICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICAgIHJldHVybiBvbkVuY29kZWQoZW5jb2RlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWNvZGVkKSB7XG4gICAgICAgIHJldHVybiBvbkRlY29kZWQoZGVjb2RlZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBlbmNvZGUgPSAodGV4dDogc3RyaW5nKSA9PiB0aGlzLiN3b3JrZXIucG9zdE1lc3NhZ2UoeyBhY3Rpb246ICdlbmNvZGUnLCB0ZXh0IH0pO1xuICBkZWNvZGUgPSAoZW5jb2RlZDogc3RyaW5nKSA9PiB0aGlzLiN3b3JrZXIucG9zdE1lc3NhZ2UoeyBhY3Rpb246ICdlbmNvZGUnLCBlbmNvZGVkIH0pO1xufVxuIl19