// Sintaxe strict mode para todo o script
import XLSX from 'xlsx';
import imaps from 'imap-simple';
import nodemailer from 'nodemailer';
import _ from 'lodash';
import fetch from "node-fetch";

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

function deleteProperties(json, properties, separator) { 
    properties.split(separator).map((property) => { 
        delete json[property.trim()];
    });
    return json;
}

function setFiltersToURL(url, json) {
	let properties = getProperties(json);
	for (const propertie of properties) {
		let value = json[propertie];
		url = addFiltersToURL(url, propertie, value);
	}
	return url;
}

function addFiltersToURL(url, key, value) {
	return (url.includes('?') ? `${url}&${key}=${value}` : `${url}?${key}=${value}`);
}

function calculatePercent(total, partes) {
    return ((partes * 100) / total).toFixed();
}

function downloadBlob(values, name, type) {
	var blob = new Blob([values], { type: type });
	let downloadLink = document.createElement('a');
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.target = '_blank';
	downloadLink.download = name;
	downloadLink.click();

	URL.revokeObjectURL(blob);
}

function downloadUrl(values, name, type) {
	let downloadLink = document.createElement('a');
	downloadLink.href = values;
	downloadLink.target = '_blank';
	downloadLink.download = name;
	downloadLink.click();
}

function responseAddressHandler(data) {
	var arrayAddr = Object.entries(data.E_SEGVIA)
					.filter((item) => { return item[0].includes('ENDE'); })
					.map((item) => { return item[1]; });

    var arrayFormated = [];
    arrayFormated.push(arrayAddr[0]);
    arrayFormated.push(arrayAddr[0] + arrayAddr[1]);
    arrayFormated.push(arrayAddr[2]);
    arrayFormated.push(arrayAddr[3] + arrayAddr[4].substr(0, 9));

	return arrayFormated;
}

function responseErrorHandler(retornoJSON) {
	var retornoERRO = retornoJSON.T_RETORNO.filter((item) => { return item.TYPE == "E"; });
	if (retornoERRO.length > 0) {
		throw new Error(retornoERRO.map((item) => { return item.MESSAGE; }));
	}
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Define the chunk method in the prototype of an array
 * that returns an array with arrays of the given size.
 *
 * @param chunkSize {Integer} Size of every group
 */
function chunk(array, chunkSize) {
    var temporal = [];
    for (var i = 0; i < array.length; i+= chunkSize) {
        temporal.push(array.slice(i,i+chunkSize));
    }
    return temporal;
}

/**
 * Define the chunk method in the prototype of an array
 * that returns an array with arrays of the given size.
 *
 * @param chunkSize {Integer} Size of every group
 */
function chunkMap(array, chunkSize) {
    var that = array;
    return Array(Math.ceil(that.length/chunkSize)).fill().map(function(_,i) {
        return that.slice(i*chunkSize,i*chunkSize+chunkSize);
    });
}

/**
 * Define the chunk method in the prototype of an array
 * that returns an array with arrays of the given size (with a recursive function).
 *
 * @param chunk_size {Integer} Size of every group
 */
function chunkSlice(array, chunk_size) {
    if ( !array.length ) {
        return [];
    }
    return [ array.slice( 0, chunk_size ) ].concat(array.slice(chunk_size).chunk(chunk_size));
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} array to split
 * @param chunk_size {Integer} Size of every group
 */
function chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];    
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }
    return tempArray;
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
function chunkArraySplice(myArray, chunk_size) {
    var results = [];
    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}

function timeoutPromisse(interval, promise) {
	return new Promise((resolve, reject) => {
	  setTimeout(() => {
		reject(new Error("timeout"));
	  }, interval);
	  promise.then(resolve, reject);
	});
}

function abortableFetch(request, opts) {
	const controller = new AbortController();
	const signal = controller.signal;
	return {
	  abort: () => controller.abort(),
	  promise: fetch(request, { ...opts, signal })
	};
}

function timeoutFetch(interval, abortableFetch) {
	return new Promise((resolve, reject) => {
	  setTimeout(() => {
		abortableFetch.abort();
		reject(new Error("Fetch Request Aborted by TimeOut!"));
	  }, interval);
	  abortableFetch.promise.then(resolve, reject);
	});
}

/**
 * Define the filter method in the prototype of an array
 * that returns an array filtered by params sets.
 *
 * @param key {AlfaNumeric} Key of array element
 * @param value {AlfaNumeric} Value of array element
 * @param searchMode {String} 'like' or null
 */
function filterInArray(array, key, value, searchMode) {
	let retorno = [];
	switch (searchMode.toLowerCase()) {
		case "like":
			retorno = array.filter(item => (!!item[key] ? item[key].includes(value) : null));
		break;
		case "regex":
			retorno = array.filter(item => value.test(item[key]));
		break;
		default:
			retorno = array.filter(item => (!!item[key] ? item[key] == value : null));
		break;
	}
	return retorno;
}

function excelToJSON(data, type) {
	let workbook = XLSX.read(data, {type: type});
	return {
		name: workbook.SheetNames[0],
		sheet: workbook.Sheets[workbook.SheetNames[0]],
		data: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
	};
}

function createFileData(idElement, name, datas, properties) {
	let fileData = { 
		id: idElement, 
		name: (!!name? name : ""), 
		datas: (!!datas ? datas : []), 
		dataProperties: (!!properties ? properties : [])
	};
	if (fileData.datas.length > 0) {
		getFileDataProperties(fileData);
	}
	return fileData;
}

function getFileDataProperties(fileData) {
	let properties = getProperties(fileData.datas[0]);
	fileData.dataProperties = [...properties];
}

function getProperties(datas) {
	let dataProperties = [];
	for (var property in datas ) {
		dataProperties.push(property); 
	}
	return dataProperties;
}

function clearPhone(phone) {
	let regex = /[^\d]/g; 
	phone = phone.replace(regex, '');
	phone = (phone.startsWith('55') ? phone : `55${phone}`);
	return phone;
}

function validatePhone(phone, tam) {
	return (phone.length >= tam ? true : false);
}

function sendEmail(mail) {
	return new Promise((resolve, reject) => {
		var transporter = nodemailer.createTransport({
			service: 'Hotmail',
			secure: false,
			auth: {
				user: process.env.userMail,
				pass: process.env.passMail
			}
		});
		  
		var mailOptions = {
			from: process.env.userMail,
			to: mail.to,
			subject: mail.subject,
			text: (mail.isHTML == false ? mail.content : ''),
			html: (mail.isHTML == true ? mail.content : '')
		};
		  
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				reject(error);
			} else {
				resolve('Email sent: ' + info.response);
			}
		});
	});
}

function getEmailAttachments() {
	let config = {
		imap: {
			user: process.env.USERIMAP,
			password: process.env.PASSIMAP,
			host: process.env.IMAP,
			port: 993,
			tls: true,
			authTimeout: 9000
		}
	};

	return imaps.connect(config).then(function (connection) {
		connection.openBox('INBOX').then(function () {
			// Fetch emails from the last 24h
			var delay = 24 * 3600 * 1000;
			var yesterday = new Date();
			yesterday.setTime(Date.now() - delay);
			yesterday = yesterday.toISOString();

			var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
			var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
			return connection.search(searchCriteria, fetchOptions);
		}).then(function (messages) {
			var attachments = [];
			messages.forEach(function (message) {
				var parts = imaps.getParts(message.attributes.struct);
				attachments = attachments.concat(parts.filter(function (part) {
					return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
				}).map(function (part) {
					return connection.getPartData(message, part)
						.then(function (partData) {
							return {
								filename: part.disposition.params.filename,
								data: partData
							};
						});
				}));
			});
			return Promise.all(attachments);
		}).then(function (attachments) {
			return attachments
		});
	});
}

function firstWord(string, separator) {
	let _separator = separator || ' ';
	let arrString = (!!string ? string.split(_separator) : string);
	return arrString.shift();
}

function lastWord(string, separator) {
	let _separator = separator || ' ';
	let arrString = (!!string ? string.split(_separator) : string);
	return arrString.pop();
}

function objectDeepSearch(object, key, value, retorno) {
	if (object.hasOwnProperty(key)) {
		retorno.push(object);
		objectDeepSearch(object[value], key, value, retorno);
	} else {
		return retorno;
	}
}

function copyObject(object) {
	return JSON.parse(JSON.stringify(object));
}

function shallowCopyObject(object) {
	return { ...object };
}

function apiCaller(apiURL, config) {
    return fetch(apiURL, {
        method: config.method, 
        headers: { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json',
            'authorization': config.token
        },
        body: JSON.stringify(config.data)
    })
    .then((response) => response.json() )
    .then((data) => {  return data; });
}

function apiMethods() {
    return [`GET`, `POST`, `PUT`, `PATCH`, `DELETE`];
}

async function getToken(apiURL, user) {
    let loginAPI = `${apiURL}/login`;
    return apiCaller(loginAPI, { method: `POST`, data: user });
}

function parseErrors(nodeRestfulErrors){
	const errors = [];
	_.forIn(nodeRestfulErrors, error => errors.push(error.message));
	return errors;
}

function sendErrorsOrNext(req, res, next) {
	const bundle = res.locals.bundle;
	if(bundle.errors) {
		var errors = parseErrors(bundle.errors);
		res.status(500).json({errors});
	}else {
		next();
	}
}

function requestDetail(req) {
	return `${req.path} ${ JSON.stringify(req.query)} Requested at: ${new Date().toISOString()}`;
}

function uniqueID() {
	return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
}

function diffDate(initialDate, finalDate) {
	const diff = Math.abs(finalDate.getTime() - initialDate.getTime());
	const minutes = Math.ceil(diff / (1000 * 60));
	const hours = Math.ceil(diff / (1000 * 60 * 60));
	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	const years = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365));

	return minutes;
}

function minutesToHours(minutos) {
	const horas = Math.floor(minutos/ 60);
	const min = minutos % 60;
	const textoHoras = (`00${horas}`).slice(-2);
	const textoMinutos = (`00${min}`).slice(-2);

	return `${textoHoras }h:${textoMinutos}min`;
}

function addMinutes(data, minutes) {
	return new Date(data.setMinutes(data.getMinutes() + minutes));
}

function delMinutes(data, minutes) {
	return new Date(data.setMinutes(data.getMinutes() - minutes));
}

function diasNoMes(mes, ano) {
	var data = new Date(ano, mes, 0);
	return data.getDate();
}

function getDiasNoMes(mes, ano) {
	let diasDoMes = [];	
	for (let dia = 1; dia <= diasNoMes(mes, ano); dia++) {
		let data = `${ano.toString()}-${mes.toString().padStart(2, `0`)}-${dia.toString().padStart(2, `0`)}`;
		console.log(data);
		diasDoMes.push(data);
	}
	return diasDoMes;
}

export default {
	pipe,
	compose,
    deleteProperties,
    addFiltersToURL,
	setFiltersToURL,
	calculatePercent,
	downloadBlob,
	downloadUrl,
	responseAddressHandler,
	responseErrorHandler,
	timeout,
	chunk,
	chunkMap,
	chunkSlice,
	chunkArray,
	chunkArraySplice,
	timeoutPromisse,
	abortableFetch,
	timeoutFetch,
	filterInArray,
	excelToJSON,
	createFileData,
	getFileDataProperties,
	getProperties,
	clearPhone,
	validatePhone,
	getEmailAttachments,
	sendEmail,
	firstWord,
	lastWord,
	objectDeepSearch,
	copyObject,
	shallowCopyObject,
	apiMethods,
	apiCaller,
	getToken,
	sendErrorsOrNext,
	uniqueID,
	diffDate,
	minutesToHours,
	addMinutes,
	delMinutes,
	requestDetail,
	diasNoMes,
	getDiasNoMes
};