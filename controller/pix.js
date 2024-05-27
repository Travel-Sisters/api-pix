const https = require("https");
var axios = require("axios");
var fs = require("fs");

const options = require('../credentials/credentials')


base_url = options.sandbox == true ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"
console.log("rota do ambiente: ", base_url)

const getAccessToken = async () => {
    var data = JSON.stringify({ grant_type: "client_credentials" });
    var data_credentials = options.client_id + ":" + options.client_secret;
    var auth = Buffer.from(data_credentials).toString("base64");
    const certificate = fs.readFileSync(options.certificate)
    const agent = new https.Agent({
        pfx: certificate,
        passphrase: '',
    })
    var config = {
        method: "POST",
        url: base_url + "/oauth/token",
        headers: {
            Authorization: "Basic " + auth,
            "Content-Type": "application/json",
        },
        httpsAgent: agent,
        data: data,
    }
    try {
        const response = await axios(config);
        console.log('\n', JSON.stringify(response.data), '\n');
        return response.data.access_token
    } catch (error) {
        console.log('\n', error, '\n');
    }
}



const create_cob = async (access_token, dataCob) => {

    const certificate = fs.readFileSync(options.certificate)

    const agent = new https.Agent({
        pfx: certificate,
        passphrase: '',
    })

    var config = {
        method: "POST",
        url: base_url + "/v2/cob",
        headers: {
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
        },
        httpsAgent: agent,
        data: dataCob,
    }

    try {
        const response = await axios(config);
        console.log('\n', JSON.stringify(response.data), '\n');
        return response.data
    } catch (error) {
        console.log('\n', error, '\n');
    }


}

// const create_cob = async (access_token, dataCob) => {
//     const certificate = fs.readFileSync(options.certificate);
//     const agent = new https.Agent({
//         pfx: certificate,
//         passphrase: '',
//     });

//     var config = {
//         method: "POST",
//         url: base_url + "/v2/cob",
//         headers: {
//             Authorization: "Bearer " + access_token,
//             "Content-Type": "application/json",
//         },
//         httpsAgent: agent,
//         data: dataCob,
//     };

//     try {
//         const response = await axios(config);
//         // Verifica o status HTTP da resposta
//         if (response.status === 200 || response.status === 201) {
//             console.log('\n', JSON.stringify(response.data), '\n');
//             return response.data;
//         } else {
//             // Se o status não for 200, lança um erro
//             throw new Error(`Erro na requisição: status ${response.status}`);
//         }
//     } catch (error) {
//         console.log('\n', error, '\n');
//         throw error; // Lança o erro para ser tratado pelo código que chama essa função
//     }
// };

const getQrcode = async (access_token, locId) => {

    const certificate = fs.readFileSync(options.certificate)

    const agent = new https.Agent({
        pfx: certificate,
        passphrase: '',
    })

    var config = {
        method: "GET",
        url: base_url + "/v2/loc/" + locId + "/qrcode",
        headers: {
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
        },
        httpsAgent: agent,
    }

    try {
        const response = await axios(config);
        console.log('\n', JSON.stringify(response.data), '\n');
        return response.data
    } catch (error) {
        console.log('\n', error, '\n');
    }

}

async function gerar_cobranca(req, res) {

	data = req.body

	try {
		token = await getAccessToken()
		const response = await create_cob(token, data)
		res.status(200).json({response})
	
	} catch (error) {
		console.error('erro na cobrança', error)
    	res.status(500).json({ error: 'Erro interno do servidor' })
	}
	
}

async function gerar_qrcode(req, res) {
	
	const locId = req
    .params.locId

	try {

		token = await getAccessToken()
		const response = await getQrcode(token, locId)
		res.status(200).json({response})

	} catch (error) {
        console.error('erro no qrcode', error)
    	res.status(500).json({ error: 'Erro interno do servidor' })
	}

}

async function gerar_qrcode_mobile(req, res) {

    data = req.body

    try {
		token = await getAccessToken()
		const response_cob = await create_cob(token, data)
        console.log(response_cob.loc.id)
        const response_qrcode = await getQrcode(token, response_cob.loc.id)
        const retorno = response_qrcode.imagemQrcode
		res.status(200).json({retorno})
	
	} catch (error) {
		console.error('erro na cobrança', error)
    	res.status(500).json({ error: 'Erro interno do servidor' })
	}

}

module.exports = {
    gerar_cobranca,
	gerar_qrcode,
    gerar_qrcode_mobile
}