const S = require('string');
export default class S3Utils {

    static fileKeyNameGenerator(filename: string) {
        let ext = filename.slice(filename.lastIndexOf("."));
        filename = filename.slice(0, filename.lastIndexOf("."));
        
        let unixTime = new Date().getTime().toString();        
        filename = filename.concat(`-${unixTime}`);

        return filename.concat(ext);
    }

    static cleanS3Filename(filename: string) {
        console.log("COMMONS: Starting cleanFilename method");
        let ext = filename.slice(filename.lastIndexOf("."));
        filename = filename.slice(0, filename.lastIndexOf("."));
        filename = S(filename).latinise().s;
        filename = filename.toLowerCase();
        filename = S(filename).dasherize().s;
        filename = filename = filename.replace(/[&\/\\#,+$~%'":.*¿?<>{}()]|\||\[|\]/g, "").trim();
        console.log("COMMONS: Finished cleanFilename method");
        return filename.concat(ext);
    }


    static s3UrlEncode(filename: string) {

        var encodingCharacters = {
            '\+': "%2B",
            '\!': "%21",
            '\"': "%22",
            '\#': "%23",
            '\$': "%24",
            '\&': "%26",
            '\'': "%27",
            '\(': "%28",
            '\)': "%29",
            '\*': "%2A",
            '\,': "%2C",
            '\:': "%3A",
            '\;': "%3B",
            '\=': "%3D",
            '\?': "%3F",
            '\@': "%40",
        };

        return encodeURI(filename)
            .replace(
                /(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/img,
                function (match) { return encodingCharacters[match]; }
            );

    }
}