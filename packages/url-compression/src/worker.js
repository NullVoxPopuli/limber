import * as LZString from 'lz-string';
function encode(text) {
    return LZString.compressToBase64(text);
}
function decode(text) {
    return LZString.decompressFromBase64(text);
}
let last;
function queueEncode(text) {
    if (last) {
        cancelIdleCallback(last);
    }
    last = requestIdleCallback(() => {
        let encoded = encode(text);
        globalThis.postMessage({ encoded });
    });
}
globalThis.addEventListener('message', (event) => {
    let { action } = event.data;
    switch (action) {
        case 'encode':
            /**
             * Since typing can be quick, we don't want to do more work that we have to.
             */
            return queueEncode(event.data.text);
        case 'decode': {
            // Decoding is *way* faster than encoding, so
            // we can immediately send the message back
            let decoded = decode(event.data.encoded);
            globalThis.postMessage({
                decoded,
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBRXRDLFNBQVMsTUFBTSxDQUFDLElBQVk7SUFDMUIsT0FBTyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFDLElBQVk7SUFDMUIsT0FBTyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELElBQUksSUFBWSxDQUFDO0FBRWpCLFNBQVMsV0FBVyxDQUFDLElBQVk7SUFDL0IsSUFBSSxJQUFJLEVBQUU7UUFDUixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQjtJQUVELElBQUksR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUU7UUFDOUIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNCLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUMvQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUU1QixRQUFRLE1BQU0sRUFBRTtRQUNkLEtBQUssUUFBUTtZQUNYOztlQUVHO1lBQ0gsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ2IsNkNBQTZDO1lBQzdDLDJDQUEyQztZQUMzQyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6QyxVQUFVLENBQUMsV0FBVyxDQUFDO2dCQUNyQixPQUFPO2FBQ1IsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgTFpTdHJpbmcgZnJvbSAnbHotc3RyaW5nJztcblxuZnVuY3Rpb24gZW5jb2RlKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gTFpTdHJpbmcuY29tcHJlc3NUb0Jhc2U2NCh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gTFpTdHJpbmcuZGVjb21wcmVzc0Zyb21CYXNlNjQodGV4dCk7XG59XG5cbmxldCBsYXN0OiBudW1iZXI7XG5cbmZ1bmN0aW9uIHF1ZXVlRW5jb2RlKHRleHQ6IHN0cmluZykge1xuICBpZiAobGFzdCkge1xuICAgIGNhbmNlbElkbGVDYWxsYmFjayhsYXN0KTtcbiAgfVxuXG4gIGxhc3QgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+IHtcbiAgICBsZXQgZW5jb2RlZCA9IGVuY29kZSh0ZXh0KTtcblxuICAgIGdsb2JhbFRoaXMucG9zdE1lc3NhZ2UoeyBlbmNvZGVkIH0pO1xuICB9KTtcbn1cblxuZ2xvYmFsVGhpcy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gIGxldCB7IGFjdGlvbiB9ID0gZXZlbnQuZGF0YTtcblxuICBzd2l0Y2ggKGFjdGlvbikge1xuICAgIGNhc2UgJ2VuY29kZSc6XG4gICAgICAvKipcbiAgICAgICAqIFNpbmNlIHR5cGluZyBjYW4gYmUgcXVpY2ssIHdlIGRvbid0IHdhbnQgdG8gZG8gbW9yZSB3b3JrIHRoYXQgd2UgaGF2ZSB0by5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHF1ZXVlRW5jb2RlKGV2ZW50LmRhdGEudGV4dCk7XG4gICAgY2FzZSAnZGVjb2RlJzoge1xuICAgICAgLy8gRGVjb2RpbmcgaXMgKndheSogZmFzdGVyIHRoYW4gZW5jb2RpbmcsIHNvXG4gICAgICAvLyB3ZSBjYW4gaW1tZWRpYXRlbHkgc2VuZCB0aGUgbWVzc2FnZSBiYWNrXG4gICAgICBsZXQgZGVjb2RlZCA9IGRlY29kZShldmVudC5kYXRhLmVuY29kZWQpO1xuXG4gICAgICBnbG9iYWxUaGlzLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgZGVjb2RlZCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSk7XG4iXX0=