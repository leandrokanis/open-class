# ADR-010 — Autorização por papel via RolesGuard + decorator @Roles()

**Status**: Aceito  
**Data**: 2026-05-16  
**Deciders**: Leandro Alves

---

## Contexto

A plataforma possui três papéis de usuário — `aluno`, `instrutor` e `admin` — já modelados no schema (`roleEnum`) e propagados no payload JWT. O próximo passo é aplicar autorização por papel em rotas específicas da API.

Precisávamos definir como declarar quais papéis têm acesso a cada rota e como fazer a verificação em runtime sem acoplamento forte entre o guard e os controllers.

---

## Decisão

Implementar autorização via dois artefatos complementares:

1. **`@Roles(...roles)` — decorator de metadados**  
   Decorator customizado que grava os papéis exigidos nos metadados da rota usando `SetMetadata('roles', roles)`. Permite declaração direta no controller:
   ```ts
   @Roles('admin')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Delete(':id')
   remove() { … }
   ```

2. **`RolesGuard` — NestJS guard de autorização**  
   Guard que lê os metadados da rota via `Reflector`, compara com o papel presente em `request.user.role` (injetado pelo `JwtStrategy`) e retorna `true` ou lança `ForbiddenException`.

A autenticação (`JwtAuthGuard`) é sempre verificada antes da autorização (`RolesGuard`). Os dois guards são compostos por rota, não globalmente, para preservar a granularidade de controle.

---

## Alternativas consideradas

| Alternativa | Por que descartada |
|---|---|
| CASL (biblioteca de autorização) | Overhead desnecessário para três papéis fixos; complexidade injustificada neste estágio |
| Guard global com lógica interna | Dificulta rotas públicas e mistura autenticação com autorização |
| Enum de permissões granulares | Prematura; papéis simples cobrem todos os casos de uso do v1.0 |

---

## Consequências

**Positivas:**
- Declaração de papéis diretamente no controller — zero boilerplate extra por rota
- `RolesGuard` stateless e sem dependência de banco — verificação em memória a partir do JWT
- Fácil de escalar para permissões granulares no v2.0 sem mudar a interface pública

**Negativas/trade-offs:**
- Papéis codificados como string literal (sem enum compartilhado por toda a API); mitigado com `Role` enum no módulo de autorização
- Mudança de papel de um usuário reflete somente após re-emissão do token (próximo login); comportamento documentado e aceitável dado o modelo JWT stateless (ver ADR-003)

---

## Relacionamentos

- Depende de: [ADR-003 — JWT stateless via cookie httpOnly](003-jwt-httponly-cookie.md)
- Relacionado a: [ADR-001 — NestJS como framework da API](001-nestjs-api-framework.md)
