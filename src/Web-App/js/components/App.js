const {Component, useState, hooks} = owl;
const {useRef, useSubEnv} = hooks;
const {xml} = owl.tags;
const {whenReady} = owl.utils;


const BOOKING_URL = "https://cdn-api.co-vin.in/api/v2/appointment/schedule";
const BENEFICIARIES_URL = "https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries";
const CALENDAR_URL_DISTRICT = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id={0}&date={1}";
const CALENDAR_URL_PINCODE = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode={0}&date={1}";
const CAPTCHA_URL = "https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha";
const OTP_PUBLIC_URL = 'https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP';
const GENERATE_OTP_PRO_URL = 'https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP';
const VERIFY_OTP_PRO_URL = 'https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp';


class App extends Component {
    static template = xml`
    <div class="container">
        <div class="row" t-if="showMobileInput">
            <div class="col-12">
                <div class="form-group">
                    <label for="input_mobile">Mobile No:</label>
                    <input type="text" class="form-control" id="input_mobile" t-ref="input_mobile"/>
                </div>
                <button class="btn btn-primary" t-on-click="onClickGetOTP">Get OTP</button>
            </div>
        </div>
        <div class="row" t-if="showOTPInput">
            <div class="col-12">
                <div class="form-group">
                    <label for="input_otp">OTP:</label>
                    <input type="input" class="form-control" id="input_otp" t-ref="input_otp"/>
                </div>
                <button class="btn btn-primary" t-on-click="onClickVerifyOTP">Verify OTP</button>
            </div>
        </div>
        <div class="row" t-if="beneficiaries.length">
            <div class="col-12">
                <div class="table-responsive">
                    <table class="table table-borderless table-striped">
                        <thead>
                            <tr>
                                <th>beneficiary_reference_id</th>
                                <th>Name</th>
                                <th>Birth Year</th>
                                <th>Gender</th>
                                <th>Mobile Number</th>
                                <th>Photo Id Type</th>
                                <th>Photo Id Number</th>
                                <th>Comorbidity Ind</th>
                                <th>Vaccination Status</th>
                                <th>Vaccine</th>
                                <th>Dose1 Date</th>
                                <th>Dose2 Date</th>
                                <th>Appointments</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-foreach="beneficiaries" t-as="b" t-key="b">
                                <tr>
                                    <td><t t-esc="b.beneficiary_reference_id"/></td>
                                    <td><t t-esc="b.name"/></td>
                                    <td><t t-esc="b.birth_year"/></td>
                                    <td><t t-esc="b.gender"/></td>
                                    <td><t t-esc="b.mobile_number"/></td>
                                    <td><t t-esc="b.photo_id_type"/></td>
                                    <td><t t-esc="b.photo_id_number"/></td>
                                    <td><t t-esc="b.comorbidity_ind"/></td>
                                    <td><t t-esc="b.vaccination_status"/></td>
                                    <td><t t-esc="b.vaccine"/></td>
                                    <td><t t-esc="b.dose1_date"/></td>
                                    <td><t t-esc="b.dose2_date"/></td>
                                    <td><t t-esc="b.appointments"/></td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;

    constructor() {
        super(...arguments);
        let useToken = sessionStorage.getItem('userToken');
        this.state = useState({
            beneficiaries: [],
            showMobileInput: useToken ? false : true,
            showOTPInput: false,
        });
        this.userToken = useToken;
        if (this.userToken) {
            this.getBeneficiaries();
        }
        this.baseRequestHeader = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
        }
        this.mobileInput = useRef('input_mobile');
        this.OTPInput = useRef('input_otp');
    }

    get beneficiaries() {
        return this.state.beneficiaries || [];
    }

    get showMobileInput() {
        return this.state.showMobileInput;
    }

    get showOTPInput() {
        return this.state.showOTPInput;
    }

    async generateTokenOTP() {
        let mobile = this.mobileInput.el.value;
        if (mobile.length === 10) {
            let body = {
                mobile: mobile,
                secret: "U2FsdGVkX1+z/4Nr9nta+2DrVJSv7KS6VoQUSQ1ZXYDx/CJUkWxFYG6P3iM/VW+6jLQ9RDQVzp/RcZ8kbT41xw=="
            }
            const req = await fetch(GENERATE_OTP_PRO_URL, {
                method: 'POST',
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
                },
                body: JSON.stringify(body) // body data type must match "Content-Type" header
            });
            let res = await req.json();
            this.txnId = res.txnId;
            this.state.showOTPInput = true;
            this.state.showMobileInput = false;
        }
    }

    async verifyTokenOTP() {
        if (this.OTPInput.el.value) {
            let body = {
                otp: this.SHA256(this.OTPInput.el.value),
                txnId: this.txnId
            };
            const req = await fetch(VERIFY_OTP_PRO_URL, {
                method: 'POST',
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
                },
                body: JSON.stringify(body) // body data type must match "Content-Type" header
            });
            let res = await req.json();
            if (!res.error) {
                this.state.showOTPInput = false;
                this.state.showMobileInput = false;
                this.userToken = res.token;
                sessionStorage.setItem('userToken', res.token);
                this.getBeneficiaries();
            }
        }
    }

    onClick() {
        this.getBeneficiaries()
    }

    onClickGetOTP(ev) {
        ev.stopPropagation();
        this.generateTokenOTP(0)
    }

    onClickVerifyOTP(ev) {
        ev.stopPropagation();
        this.verifyTokenOTP()
    }

    /**
     * Secure Hash Algorithm (SHA256)
     * http://www.webtoolkit.info/
     * Original code by Angel Marin, Paul Johnston
     **/

    SHA256(s) {
        var chrsz = 8;
        var hexcase = 0;

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function S(X, n) {
            return (X >>> n) | (X << (32 - n));
        }

        function R(X, n) {
            return (X >>> n);
        }

        function Ch(x, y, z) {
            return ((x & y) ^ ((~x) & z));
        }

        function Maj(x, y, z) {
            return ((x & y) ^ (x & z) ^ (y & z));
        }

        function Sigma0256(x) {
            return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
        }

        function Sigma1256(x) {
            return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
        }

        function Gamma0256(x) {
            return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
        }

        function Gamma1256(x) {
            return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
        }

        function core_sha256(m, l) {
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;

            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;

            for (var i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];

                for (var j = 0; j < 64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));

                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }

                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }

        function str2binb(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
            }
            return bin;
        }

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }

        function binb2hex(binarray) {
            var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
            var str = '';
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
            }
            return str;
        }

        s = Utf8Encode(s);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
    }

    async getBeneficiaries(ev) {
        let header = Object.assign({}, this.baseRequestHeader, {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.userToken,
        });
        try {
            const req = await fetch(BENEFICIARIES_URL, {
                method: 'GET',
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: header,
            });
            let res = await req.json();


            await fetch(CAPTCHA_URL, {
                method: 'POST',
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: header,
            });
            if (!res.error) {
                this.state.beneficiaries = res.beneficiaries || [];
            } else {
                this.sessionLogout()
            }
        } catch (ex) {
            this.sessionLogout();
        }
    }

    sessionLogout() {
        sessionStorage.removeItem('userToken')
        this.state.showOTPInput = false;
        this.state.showMobileInput = true;
    }
}

// Setup code
function setup() {
    const app = new App();
    app.mount(document.body);
}

whenReady(setup);
