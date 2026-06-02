# ADR-022 — MailHog como servidor SMTP local para desenvolvimento

**Data**: 2026-06-02
**Status**: Aceito
**Decisores**: Leandro Alves

---

## Contexto

A US-19 adiciona um teste de configuração de e-mail que envia uma mensagem real
via SMTP. Para desenvolver e validar esse fluxo — assim como a recuperação de
senha — sem depender de um provedor SMTP externo (Gmail, SendGrid, etc.) nem
correr o risco de enviar e-mails de verdade para endereços reais, é preciso um
servidor SMTP local que capture as mensagens.

Hoje, quando `SMTP_HOST` está ausente, o `MailService` apenas loga o link no
console. Isso impede testar o caminho de envio de ponta a ponta em ambiente de
desenvolvimento.

## Decisão

Adicionar o **MailHog** (`mailhog/mailhog`) como serviço no `docker-compose.yml`,
expondo SMTP em `:1025` e a interface web em `:8025`. Em desenvolvimento, define-se
`SMTP_HOST=localhost` e `SMTP_PORT=1025` para que todos os e-mails sejam
capturados e inspecionáveis na UI do MailHog, sem entrega externa.

O MailHog é um recurso **exclusivo de desenvolvimento** e não faz parte da
arquitetura de produção (o `docker-compose.prod.yml` continua apontando para o
SMTP externo do administrador). Por isso não é representado no diagrama C4, que
modela o `Servidor SMTP` externo já existente.

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| **MailHog** *(escolhida)* | Amplamente conhecido; imagem leve; SMTP + UI web; zero configuração | Manutenção upstream estagnada |
| Mailpit (`axllent/mailpit`) | Sucessor ativo do MailHog; UI moderna; mesma proposta | Menos familiar à equipe no momento |
| MailDev | UI simples; popular no ecossistema Node | Imagem maior; menos usado em compose self-hosted |
| Apenas log no console (atual) | Nenhuma infra adicional | Não exercita o código de envio SMTP de verdade |

## Consequências

**Positivas**:
- Permite testar o botão "Testar configuração" e a recuperação de senha localmente, com SMTP real.
- Evita envio acidental de e-mails para endereços reais em dev.
- Mantém a configuração de produção inalterada.

**Negativas / trade-offs**:
- Mais um container no ambiente de desenvolvimento.
- MailHog tem manutenção upstream reduzida; migração para Mailpit pode ser avaliada no futuro.

## Notas de implementação

- Serviço no `docker-compose.yml`:
  - imagem `mailhog/mailhog`
  - portas `1025:1025` (SMTP) e `8025:8025` (UI web)
- Em dev: `SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `SMTP_FROM` qualquer remetente de teste.
- Não adicionar o MailHog ao `docker-compose.prod.yml`.
