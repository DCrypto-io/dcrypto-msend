export const sum = function(values) {
    let s = 0;

    values.forEach(v => {
        s += v; 
    })

    return parseFloat(s.toFixed(5));
}