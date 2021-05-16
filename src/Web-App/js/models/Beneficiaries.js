
const BENEFICIARIES_URL = "https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries";

class ModelBeneficiaries {
    constructor(record) {
        this.beneficiary_reference_id = record.beneficiary_reference_id;
        this.name = record.name;
        this.birth_year = record.birth_year;
        this.gender = record.gender;
        this.mobile_number = record.mobile_number;
        this.photo_id_type = record.photo_id_type;
        this.photo_id_number = record.photo_id_number;
        this.comorbidity_ind = record.comorbidity_ind;
        this.vaccination_status = record.vaccination_status;
        this.vaccine = record.vaccine;
        this.dose1_date = record.dose1_date;
        this.dose2_date = record.dose2_date;
        this.appointments = record.appointments;
    }
}

Object.defineProperties(ModelBeneficiaries, {
    'fetchBeneficiaries': {
        value: async function () {
            // const req = await fetch(BENEFICIARIES_URL, {
            //     method: 'GET',
            //     mode: 'cors', // no-cors, *cors, same-origin
            //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //     credentials: 'same-origin', // include, *same-origin, omit
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJiZmQ2YTc5OC1hMjI2LTQ3OTctYTdlZC1mNzQzMWM3NTk2Y2QiLCJ1c2VyX2lkIjoiYmZkNmE3OTgtYTIyNi00Nzk3LWE3ZWQtZjc0MzFjNzU5NmNkIiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo4OTA1NjY5ODE4LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjExNzc2NDM3NDE3ODgwLCJzZWNyZXRfa2V5IjoiYjVjYWIxNjctNzk3Ny00ZGYxLTgwMjctYTYzYWExNDRmMDRlIiwidWEiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xMF8xKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMzkuMC4yMTcxLjk1IFNhZmFyaS81MzcuMzYiLCJkYXRlX21vZGlmaWVkIjoiMjAyMS0wNS0xNVQwNTozNDoxNy42ODRaIiwiaWF0IjoxNjIxMDU2ODU3LCJleHAiOjE2MjEwNTc3NTd9.VSsUBd-pwITOKgOkaAWGDrsIBUizA9FvSxA_zmyMr8g',
            //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
            //     },
            //     // body: JSON.stringify(data) // body data type must match "Content-Type" header
            // });
            let res = {"beneficiaries":[{"beneficiary_reference_id":"11776437417880","name":"Ambaliya Vasantben Babubhai ","birth_year":"1963","gender":"Female","mobile_number":"9818","photo_id_type":"Aadhaar Card","photo_id_number":"XXXXXXXX4191","comorbidity_ind":"","vaccination_status":"Partially Vaccinated","vaccine":"COVISHIELD","dose1_date":"12-04-2021","dose2_date":"","appointments":[]},{"beneficiary_reference_id":"20986069576150","name":"Ambaliya Chintankumar Babubhai","birth_year":"1994","gender":"Male","mobile_number":"9818","photo_id_type":"Aadhaar Card","photo_id_number":"XXXXXXXX6443","comorbidity_ind":"N","vaccination_status":"Not Vaccinated","vaccine":"","dose1_date":"","dose2_date":"","appointments":[]}]};
            // let res = await req.json();
            ModelBeneficiaries._cache = {};
            (res.beneficiaries || []).forEach((b, i) => {
                ModelBeneficiaries._cache[i] = new this(b);
            });
        }
    },
    '_cache': {
        value: {},
    }
});
