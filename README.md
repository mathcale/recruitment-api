<!-- markdownlint-disable MD033 MD041 -->
<p align="center">
  <h1 align="center">Recruitment API</h1>
  <p align="center">API para gestão de vagas</p>
  <p align="center"><a href="https://insomnia.rest/run/?label=Recruitment%20API&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fmathcale%2Frecruitment-api%2Fmain%2Fdocs%2Fcollections%2Finsomnia-recruitment-api.json" target="_blank"><img src="https://insomnia.rest/images/run.svg" alt="Run in Insomnia"></a></p>
</p>

## Tecnologias

- Node.js
- Nest.js
- PostgreSQL

## Configuração local

Tenha certeza que o Node.js (>=16.13.2) esteja instalado em sua máquina, caso contrário, instale-o com o utilitário [nvm](https://github.com/nvm-sh/nvm) através do comando `nvm install` na raíz do projeto. Além disso, certifique-se que o Docker está sendo executado para utilizar o banco de dados localmente.

```bash
# Faz o download das dependências do projeto com o Yarn
$ yarn

# Inicializa um container do postgresql em background através do Docker Compose
$ docker-compose up -d
```

## Ao vivo

A aplicação está deployada na Digital Ocean através do serviço App Platform e o banco de dados está no serviço [Supabase](https://supabase.io/).

- Endereço da aplicação: [https://recruitment-api-tiblj.ondigitalocean.app](https://recruitment-api-tiblj.ondigitalocean.app)

## Executando localment

Para interagir com os endpoints disponíveis, utilize a collection disponível em `docs/collections/insomnia-recruitment-api.json` através do programa [Insomnia](https://insomnia.rest/products/insomnia).

```bash
# Inicializa a aplicação em modo de desenvolvimento local com hot reload
$ yarn start:dev

# Inicializa a aplicação em modo de produção (`NODE_ENV === 'production'`)
$ yarn start:prod
```

## Testes

```bash
# Executa todos os casos de teste
$ yarn test
```

## Melhorias

- [ ] Documentação dos endpoints com Swagger/OpenAPI;
- [ ] Versionamento dos endpoints;
- [ ] Acertar tipagem/DTO de alguns endpoints;
- [ ] Adicionar Github Action para checagem dos testes à cada novo commit;
