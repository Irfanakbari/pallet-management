import saltedSha256 from 'salt-sha256'

const enkripsi = (data) => {
	return saltedSha256(data, process.env.SECRET_KEY);
}

export default enkripsi;
