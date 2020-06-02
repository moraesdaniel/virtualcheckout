# VirtualCheckout
## O que é?
VirtualCheckout é uma API rest que foi criada com o objetivo de sanar a necessidade de um controle de caixa simples.
Com ela você poderá cadastrar um caixa, uma categoria, e lançar as movimentações deste caixa.
As movimentações poderão ser tanto de entrada quanto de saída, e estarão atreladas a um caixa e a uma categoria para classificá-las.
Pode ficar tranquilo que outros usuários não verão seu caixa pois a API possui autenticação via token.
## Como instalar?
O VirtualCheckout é uma API rest escrita em JavaScript que roda sobre o interpretador NodeJS.
Ela utiliza bibliotecas muito poderosas e amplamente difundidas, além do banco de dados MySQL.
A instalação é muito simples e pode ser feita em poucos minutos:
1. Instale o [NodeJS](https://nodejs.org/en/) no ambiente onde irá rodar a API. No momento do desenvolvimento, foi utilizada a versão 12.17.0.
2. Intale o MySQL server
3. Crie um banco de dados nessa nova instalação
4. Baixe os fontes e copie para uma pasta dentro desse ambiente
5. Configure o seu banco de dados no arquivo **connection.js** que fica na pasta **dao** do projeto
6. O projeto possui um arquivo na pasta raíz chamado **package.json**. Dentro dele estão todas as dependêcias utilizadas. Basta rodar o comando ```npm install``` na pasta do projeto para que tudo seja baixado automaticamente.
Caso algo saia errado, aqui vai uma listagem das bibliotecas utilizadas e os comandos para instalação:
* [ExpressJS](https://expressjs.com/) / comando: ```npm install --save express```
* [Sequelize](https://sequelize.org/) / comando: ```npm install --save sequelize```
* [MySQL2](https://www.npmjs.com/package/mysql2) / comando: ```npm install --save mysql2```
* [JWT](https://jwt.io/) / comando: ```npm install --save jsonwebtoken```
## E como executar o dito projeto?
Para executar o projeto, você tem três opções:
* **node**: Através do prompt de comando, entre na pasta principal e execute ```node index.js```. Com este comando, seu servidor será executado porém, a cada mudança realizada nos arquivos, você precisará reiniciar a execução
* **nodemon**: O nodemon é um recurso interessante para quem está desenvolvendo pois, ele reinicia automaticamente o servidor a cada alteração realizada nos arquivos do projeto. Para utilizá-lo, realize a instalação através do comando ```npm install -g nodemon``` e execute através do comando ```nodemon index.js```
* **pm2**: Para quem vai rodar a aplicação direto em um servidor, o melhor é a execução em background. Para tal instale a biblioteca através do comando ```npm install -g pm2```. Para executar, comando ```pm2 start index.js```
## Importante
O VirtualCheckout foi escrito de forma que está escutando as requisições através da porta 9500. Isso pode ser alterado facilmente editando o arquivo index.js, fique a vontade para fazê-lo. Você pode por exemplo, colocar ele para escutar na porta 80, que é a padrão da web. Desta forma não precisará utilizar o :9500 ao chamar o endpoint.
## Certo, mas que serviços a API me oferece?
Para uma listagem completa dos recursos, acesse o [link da documentação](https://documenter.getpostman.com/view/1943546/SztG3RTE?version=latest) da API.
