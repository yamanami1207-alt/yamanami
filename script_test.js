const fs = require('fs');
const code = fs.readFileSync('./src/main.js', 'utf8');
// Mocking DOM
const dom = `
document = {
    addEventListener: (e, cb) => { if(e === 'DOMContentLoaded') cb(); },
    querySelectorAll: () => [],
    getElementById: () => ({ style: {}, addEventListener: () => {} }),
    body: { style: {} },
    documentElement: { scrollTop: 0 }
};
window = {
    location: { pathname: '', search: '', hash: '' },
    history: { replaceState: () => {} },
    scrollTo: () => {},
    addEventListener: () => {}
};
navigator = { clipboard: { writeText: () => {} } };
IntersectionObserver = class { observe() {} unobserve() {} };
`;
try {
    eval(dom + code);
    console.log("No syntax/immediate runtime errors");
} catch(e) {
    console.error("ERROR", e);
}
