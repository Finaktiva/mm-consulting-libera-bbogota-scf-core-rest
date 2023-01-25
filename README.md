# libera-scf-core-rest

## Builded with 

- [Serverless Framework](https://serverless.com/ "Serverless") on [AWS](https://aws.amazon.com/ "AWS") as Platform Provider.
- [NodeJS](https://nodejs.org/en/, "NodeJS")
- [AWSJavaScriptSDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html, "Javascript SDK")
- [TypeScript](https://www.typescriptlang.org/, "TypeScript Lang")
- [TypeORM](https://typeorm.io/#/, "TypeORM")
- [Moment Timezone](https://momentjs.com/timezone "Moment Timezone")
- [Webpack](https://webpack.js.org/, "WebpackJs")


### Tools and Management

- [Lerna](https://github.com/lerna/lerna/blob/master/README.md "Lerna")
- [Liquibase](https://www.liquibase.org/, "Liquibase")
- [Mysql Java Connector](https://mvnrepository.com/artifact/mysql/mysql-connector-java/8.0.18, "Version 8.0.18")

## Project Structure

#### `src/commons`
    
All classes and interfaces shared alongside all platform, includes things such as validators, interfaces for types, db connection, enums, responses and filters.

#### `src/funtions`

Stacks of the entire platform, contains a Serverless project by each subfolder, this corresponds to the REST layer.

#### `src/entities and src/daos`

Mappings for DB with typeORM and access data objects.

#### `properties`

Where all config and env vars lives. The [properties.example.yaml](properties/properties.example.yaml) is an example of how `properties.yaml` file has to be formated inside the same folder. The [environment.yaml](properties/environment.yaml) file contains the config of environment variables for every lambda in this project.

#### `resources`

Contains external resources (agnostic to main code)
- Mocks for Cognito Triggers
- Modeling scripts for DB with liquibase
- Error Codes

#### `src/services`

All business logic, contains all the processes.

-------

## Pre-requisites
* [AWS CLI](https://aws.amazon.com/cli/)
* [NodeJs](https://nodejs.org/en/)
* (Optional) [Lerna](https://github.com/lerna/lerna/blob/master/README.md "Lerna")
* [Serverless Framework](https://serverless.com/ "Serverless") locally or globally.



## Testing locally with the serverless-offline plugin

The root project on `package.json` file contains the script `start` that uses the [`serverless-offline`](https://www.npmjs.com/package/serverless-offline) plugin which emulates an apigateway at [localhost](http://localhost:3000) it grants a total of **5120 MB** of RAM to node.

```bash
$ npm run start
```
or if you use an a AWS CLI profile and a different stage (dev is default).
```bash
$ npm run start -- --aws-profile my-profile --stage prod
```

if you want to test a service **this will not work**, first you need to modify the `index.functions.yaml` of the respective stack by example to test the service  
```
GET /me/account
```
We need to change the file inside [`functions/me/index.functions.yaml`](src/functions/me/index.functions.yaml) and locate the path that we need to test. In this case is the next piece of code.

```yaml
getUserDetail:
  handler: ${self:custom.prefix_module, 'src/functions/me/'}list-user-detail.handler
  environment: ${file(${self:custom.rootDir}properties/variables.yml):GET_USER_DETAIL_ENV}
  events:
    - http:
        method: get
        path: me/account
        cors: true
        authorizer: 
            type: CUSTOM
            authorizerId:
              'Fn::ImportValue': libera-${self:provider.stage}-basic-authorizer
```
We need to comment the sub-object inside `authorizer` object and replace it by the value `authorizer` that corresponds to authorizer function on `libera-authorizer` like:

```yaml
getUserDetail:
  handler: ${self:custom.prefix_module, 'src/functions/me/'}list-user-detail.handler
  environment: ${file(${self:custom.rootDir}properties/variables.yml):GET_USER_DETAIL_ENV}
  events:
    - http:
        method: get
        path: me/account
        cors: true
        authorizer: Authorizer
        #    type: CUSTOM
        #    authorizerId:
        #      'Fn::ImportValue': libera-${self:provider.stage}-basic-authorizer
```
and now we can re-run the run command and test the service. If our service need an autentication token (like in this case) we need to aggregate the `Authorization: Bearer token ` header to our request. 

```bash
 $ curl --location --request GET 'http://localhost:3000/me/personal-data' \
        --header "Authorization: Bearer $TOKEN"
```
And it will give you the proper response (example)
```json
  {
    "id": 0,
    "name": "string",
    "firstSurname": "string",
    "secondSurname": "string",
    "email": "string"
  }
```

----

## Deploy to AWS
Each stack contains 3 deployment scripts `package`, `deploy`, `deploy-package` on their `package.json` file. The deploy can be as simple as

#### NOTE: CONFIG SUCH ENV AND REGION FOR AWS IS CONFIGURED ON `properties.yaml` IF YOU WANT OR NEED TO USE AN SPECIFIC REGION OR ENVIROMENT WITHOUT MODIFYING THIS FILE YOU CAN USE THE BUILTIN FLAGS  `--stage` AND `--region`. IF YOU REQUIRE THIS FEATURE PLEASE READ THE DOCS OF [package](https://serverless.com/framework/docs/providers/aws/cli-reference/package/) and [deploy](https://serverless.com/framework/docs/providers/aws/cli-reference/deploy/) COMMANDS.

```bash
$ npm run package
$ npm run deploy
```
or if you use an a aws-cli profile
```bash
$ npm run package -- --aws-profile my-profile
$ npm run deploy -- --aws-profile my-profile
```

if you want to override the region or the stage of the deployment can do (read the note above) :
```bash
$ npm run package -- --stage test --region us-west-1
$ npm run deploy
```
note that second command `deploy` does not require the `stage` and `region` flag because this command uses a pre-packaged directory

This need to me inside the desire stack to deploy. To avoid this you can use lerna and need to be run from root project like 

```bash
$ lerna run package --scope libera-me
$ lerna run deploy --scope libera-me
```
This indicate to lerna tu run the command `package` and `deploy` inside the stack `libera-me` which corresponds to the previous npm scripts above just called with lerna. Again if we want to give it some flags we can do 

```bash
$ lerna run package --scope libera-me -- -- --stage test --region us-west-1 --aws-profile my-profile
```
and so on...

Lerna has [commands](https://github.com/lerna/lerna/tree/master/commands) or [filters](https://serverless.com/framework/docs/providers/aws/cli-reference/) that can be useful such as deploy multiple stacks with one line in:

```bash
$ lerna run package --scope libera-me --scope libera-experts --scope libera-products 
$ lerna run deploy --scope libera-me --scope libera-experts --scope libera-products 
```
This command will deploy 3 stacks and we can flags as the previous examples.

We can also deploy everything with:
```bash
$ lerna run package --concurrency 1 
$ lerna run deploy --concurrency 1
```
and we cand add flags as well
```bash
$ lerna run package --concurrency 1 -- -- --aws-profile my-profile
```
can deploy all stack ignoring some of the like:
```bash
$ lerna run package --concurrency 1  --ignore libera-authorizer --ignore libera-s3 -- -- --aws-profile my-profile
```
which is goint to package all stacks but `libera-authorizer` and `libera-s3`.

You can make the deploy in just one step if you dont need it for you CI/CD integration 
simple as
```bash
$ sls deploy
```
inside the stack folder or
```bash
$ lerna run deploy-resources --scope libera-me
```
from project root. The inconvenience is that Node sets a limit of 1.5 GB for long-lived process by default. There are stacks like `libera-me` require more than that to package the stack so we can indicate a limit of memory for node like:
```bash
$ node --max-old-space-size=3072 ../../../node_modules/serverless/bin/serverless deploy --aws-profile my-profile
```
inside the stack directory. This can be handle by lerna as well, but need to aggregate this script to `package.json` for each stack.

Finally we can deploy a single function with
```bash
$ sls deploy --force -f getUserPersonalData --stage test --aws-profile my-profile
```
inside the stack folder where the funtion belongs.


Read the [serverless cli](https://serverless.com/framework/docs/providers/aws/cli-reference/) for more info.

## `Medio Melón Code Factory` 