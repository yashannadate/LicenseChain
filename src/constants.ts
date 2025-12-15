// 1. YOUR CONTRACT ADDRESS (From Remix)
export const CONTRACT_ADDRESS = "0x993d50193Ba211A20a4938623D06ce7b23CDE469";

// 2. YOUR ADMIN WALLET ADDRESS (From MetaMask)
// This is the ONLY wallet that can access the Admin Dashboard
export const ADMIN_WALLET_ADDRESS = "0x7299e79554eD0CA6AaC05e918A1cfFfAF85D40Ff"; 

// 3. YOUR CONTRACT ABI (From Remix)
export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_businessName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_issuedTo",
				"type": "address"
			}
		],
		"name": "issueLicense",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "licenseId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "businessName",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuedTo",
				"type": "address"
			}
		],
		"name": "LicenseIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "licenseId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newExpiryDate",
				"type": "uint256"
			}
		],
		"name": "LicenseRenewed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "licenseId",
				"type": "uint256"
			}
		],
		"name": "LicenseRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousAdmin",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_licenseId",
				"type": "uint256"
			}
		],
		"name": "renewLicense",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_licenseId",
				"type": "uint256"
			}
		],
		"name": "revokeLicense",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_licenseId",
				"type": "uint256"
			}
		],
		"name": "getLicense",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "licenseCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "licenses",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "businessName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "issuedTo",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_licenseId",
				"type": "uint256"
			}
		],
		"name": "verifyLicense",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];