# =============================================================================
# PetroGame - Backend FastAPI
# Integração: Mercado Pago (Checkout Transparente PIX) + Google Sheets
# =============================================================================

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import mercadopago
import gspread
from google.oauth2.service_account import Credentials
import os
import json
import hmac
import hashlib
import smtplib
import asyncio
import traceback
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Optional

# ---------------------------------------------------------------------------
# Configuração de Ambiente
# ---------------------------------------------------------------------------
load_dotenv()

MP_ACCESS_TOKEN: str  = os.getenv("MERCADO_PAGO_ACCESS_TOKEN", "")
WEBHOOK_SECRET_TOKEN: str = os.getenv("WEBHOOK_SECRET_TOKEN", "")
GOOGLE_SHEET_NAME: str    = os.getenv("GOOGLE_SHEET_NAME", "Inscricoes_PetroGame")

# E-mail SMTP (Opcional - bloqueado no Render Free)
EMAIL_REMETENTE: str = os.getenv("EMAIL_REMETENTE", "")
EMAIL_SENHA: str     = os.getenv("EMAIL_SENHA", "")
SMTP_SERVER: str     = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT: int       = int(os.getenv("SMTP_PORT", "587"))

# Google App Script (Alternativa para envio HTTP, contorna bloqueio do Render)
APP_SCRIPT_URL: str  = os.getenv("APP_SCRIPT_URL", "")

# Google Forms para equipes
FORMS_EQUIPE_URL: str = os.getenv("FORMS_EQUIPE_URL", "https://forms.gle/AfWHiYvEw8FhacdH9")

# SDK do Mercado Pago
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# ---------------------------------------------------------------------------
# Google Sheets
# ---------------------------------------------------------------------------
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def _get_sheet():
    credentials_json_str = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if credentials_json_str:
        credentials_info = json.loads(credentials_json_str)
        creds = Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
    else:
        credentials_path = os.path.join(os.path.dirname(__file__), "credentials.json.json")
        if not os.path.exists(credentials_path):
            raise FileNotFoundError(
                "credentials.json.json não encontrado. Coloque o arquivo na pasta backend/ "
                "ou defina GOOGLE_CREDENTIALS_JSON no .env"
            )
        creds = Credentials.from_service_account_file(credentials_path, scopes=SCOPES)

    client = gspread.authorize(creds)
    sheet  = client.open(GOOGLE_SHEET_NAME).worksheet("Página1")
    return sheet


def _garantir_cabecalho(sheet):
    cabecalho = ["Data", "Nome", "Email", "CPF", "Plano", "Valor", "Status", "ID_Transacao"]
    primeira_linha = sheet.row_values(1)
    if not primeira_linha:
        sheet.insert_row(cabecalho, index=1)


# ---------------------------------------------------------------------------
# E-mail de Confirmação
# ---------------------------------------------------------------------------
def _construir_html(nome: str, plano: str) -> str:
    is_equipe = plano.upper() == "EQUIPE"

    if is_equipe:
        bloco_principal = f"""
        <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#111827;">
          ✅ Inscrição da Equipe Confirmada!
        </h2>
        <p style="margin:0 0 20px;font-size:15px;color:#6b7280;">
          Sua equipe está oficialmente inscrita no <strong>PetroGame</strong>.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;">
          Olá, <strong>{nome}</strong>!<br>
          Recebemos o pagamento do plano <strong style="color:#dc2626;">EQUIPE</strong>
          e a vaga de vocês está garantida. 🎉
        </p>
        <div style="margin:28px 0;padding:24px 28px;
                    background:#fef2f2;border:2px solid #dc2626;border-radius:12px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:900;color:#dc2626;">
            ⚠️ Ação Obrigatória &mdash; Cadastro dos Membros
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:#7f1d1d;line-height:1.6;">
            O pagamento está confirmado, mas <strong>a inscrição só será válida após
            o preenchimento do formulário</strong> com os dados dos outros 3 membros.
            Prazo: <strong>48 horas</strong>.
          </p>
          <a href="{FORMS_EQUIPE_URL}"
             style="display:inline-block;background:#dc2626;color:#ffffff;
                    font-size:15px;font-weight:700;text-decoration:none;
                    padding:14px 32px;border-radius:10px;letter-spacing:.5px;">
            Preencher Formulário da Equipe &rarr;
          </a>
        </div>
        <p style="font-size:14px;color:#374151;">
          Em caso de dúvidas, entre em contato pelo Instagram da <strong>SPE UFPA</strong>.
        </p>
        """
    else:
        bloco_principal = f"""
        <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#111827;">
          🎉 Inscrição Confirmada!
        </h2>
        <p style="margin:0 0 20px;font-size:15px;color:#6b7280;">
          Sua vaga individual no <strong>PetroGame</strong> está garantida.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;">
          Olá, <strong>{nome}</strong>!<br>
          Recebemos seu pagamento — plano
          <strong style="color:#dc2626;">INDIVIDUAL</strong>. Bem-vindo(a) ao PetroGame!
        </p>
        <div style="margin:28px 0;padding:20px 24px;
                    background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#14532d;">
            📌 Próximos Passos
          </p>
          <ul style="margin:0;padding-left:18px;font-size:14px;color:#166534;line-height:1.8;">
            <li>Guarde este e-mail como comprovante de inscrição.</li>
            <li>Acompanhe o Instagram da <strong>SPE UFPA</strong> para informações.</li>
            <li>Leve um documento com foto no dia do evento.</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#374151;">
          Não é necessário nenhuma outra ação. Qualquer dúvida, fale conosco pelo Instagram.
        </p>
        """

    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#f1f5f9;padding:48px 16px;">
        <tr><td align="center">
          <table width="580" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:16px;
                        overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.10);">
            <tr>
              <td style="background:#0a0a0a;padding:36px 48px;text-align:center;">
                <p style="margin:0;font-size:10px;font-weight:700;
                          letter-spacing:4px;color:#dc2626;text-transform:uppercase;">
                  SPE UFPA
                </p>
                <h1 style="margin:10px 0 4px;font-size:32px;font-weight:900;
                           color:#ffffff;letter-spacing:2px;text-transform:uppercase;">
                  PETROGAME
                </h1>
                <p style="margin:0;font-size:11px;color:#6b7280;letter-spacing:1px;">2026</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 48px;">
                {bloco_principal}
              </td>
            </tr>
            <tr>
              <td style="padding:0 48px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;padding:24px 48px;text-align:center;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#374151;">
                  SPE UFPA &bull; Sociedade de Engenheiros de Petróleo
                </p>
                <p style="margin:0;font-size:11px;color:#9ca3af;">
                  Este é um e-mail automático &mdash; não responda a esta mensagem.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """


async def enviar_email_confirmacao(email_destino: str, nome: str, plano: str) -> None:
    print(f"[EMAIL] Iniciando envio para {email_destino!r} | Plano: {plano!r}")
    if not EMAIL_REMETENTE and not APP_SCRIPT_URL:
        print("[EMAIL] ❌ Credenciais SMTP ou APP_SCRIPT_URL não configuradas.")
        return

    assunto = (
        "[PetroGame] Inscrição da Equipe Confirmada! 🚀"
        if plano.upper() == "EQUIPE"
        else "[PetroGame] Inscrição Individual Confirmada! 🎉"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"]    = f"PetroGame SPE UFPA <{EMAIL_REMETENTE}>"
    msg["To"]      = email_destino

    texto_puro = f"Olá, {nome}!\n\nSeu pagamento no PetroGame foi confirmado. Plano: {plano.upper()}.\n"
    if plano.upper() == "EQUIPE":
        texto_puro += f"\nPreencha o formulário de membros: {FORMS_EQUIPE_URL}\n"

    msg.attach(MIMEText(texto_puro, "plain", "utf-8"))
    html_body = _construir_html(nome, plano)
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    def _enviar_sync():
        if APP_SCRIPT_URL:
            import urllib.request
            import urllib.parse
            import json
            
            payload = json.dumps({
                "to": email_destino,
                "subject": assunto,
                "htmlBody": html_body
            }).encode('utf-8')
            
            req = urllib.request.Request(APP_SCRIPT_URL, data=payload, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as response:
                print(f"[EMAIL] ✅ Enviado via App Script para {email_destino}. Status: {response.status}")
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as servidor:
                servidor.ehlo()
                servidor.starttls()
                servidor.ehlo()
                servidor.login(EMAIL_REMETENTE, EMAIL_SENHA)
                servidor.sendmail(EMAIL_REMETENTE, email_destino, msg.as_string())
                print(f"[EMAIL] ✅ Enviado via SMTP para {email_destino}")

    await asyncio.to_thread(_enviar_sync)


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PetroGame Payment API",
    description="Backend de pagamentos PIX via Mercado Pago com registro em Google Sheets.",
    version="3.0.0",
)

# Permite origins do Vercel via variável de ambiente, ou libera geral para facilitar.
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS.split(",") if ALLOWED_ORIGINS != "*" else ["*"],
    allow_credentials=True if ALLOWED_ORIGINS != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Modelos Pydantic
# ---------------------------------------------------------------------------
class PagamentoRequest(BaseModel):
    nome:      str
    email:     EmailStr
    cpf:       str
    valor:     int   # em centavos: 800 = R$8,00 | 6000 = R$60,00
    plano:     str


# ---------------------------------------------------------------------------
# Rota: Gerar cobrança PIX via Mercado Pago
# ---------------------------------------------------------------------------
@app.post("/api/gerar-pix", summary="Gerar cobrança PIX via Mercado Pago")
async def gerar_pix(dados: PagamentoRequest):
    """
    Fluxo:
    1. Salva linha na planilha como PENDENTE (com external_reference gerado).
    2. Chama Mercado Pago para criar pagamento PIX.
    3. Atualiza ID_Transacao na planilha.
    4. Retorna qr_code (Copia e Cola) e qr_code_base64 ao front-end.
    """
    print(f"\n{'='*55}")
    print(f"[PIX] Nova solicitação → {dados.nome} | {dados.email} | {dados.plano}")
    print(f"{'='*55}")

    # Valor em reais (Mercado Pago usa float)
    valor_reais = round(dados.valor / 100, 2)

    # Separar nome em first/last
    partes_nome = dados.nome.strip().split(" ", 1)
    first_name  = partes_nome[0]
    last_name   = partes_nome[1] if len(partes_nome) > 1 else "."

    # CPF limpo (apenas dígitos)
    cpf_limpo = "".join(filter(str.isdigit, dados.cpf))

    # ── 1. Salvar na planilha como PENDENTE ────────────────────────────────
    sheet: gspread.Worksheet
    indice_linha: int
    external_reference: str

    try:
        sheet = _get_sheet()
        _garantir_cabecalho(sheet)

        agora = datetime.now(timezone.utc)
        external_reference = f"PETROGAME-{agora.strftime('%Y%m%d%H%M%S')}-{cpf_limpo[-4:]}"

        nova_linha = [
            agora.strftime("%d/%m/%Y %H:%M:%S"),  # A - Data
            dados.nome,                             # B - Nome
            dados.email,                            # C - Email
            dados.cpf,                              # D - CPF
            dados.plano,                            # E - Plano
            valor_reais,                            # F - Valor (R$)
            "PENDENTE",                             # G - Status
            external_reference,                     # H - ID_Transacao (external_reference por ora)
        ]
        sheet.append_row(nova_linha, value_input_option="USER_ENTERED")

        todas_linhas  = sheet.get_all_values()
        indice_linha  = len(todas_linhas)
        print(f"[SHEETS] ✅ Linha {indice_linha} salva como PENDENTE | Ref: {external_reference}")

    except Exception as e:
        print(f"[SHEETS ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao conectar com a planilha: {str(e)}")

    # ── 2. Criar pagamento no Mercado Pago ─────────────────────────────────
    print(f"[PIX] Chamando Mercado Pago SDK... Valor: R$ {valor_reais:.2f}")

    payment_data = {
        "transaction_amount": valor_reais,
        "payment_method_id":  "pix",
        "description":        f"Ingresso PetroGame — {dados.plano}",
        "external_reference": external_reference,
        "payer": {
            "email":      dados.email,
            "first_name": first_name,
            "last_name":  last_name,
            "identification": {
                "type":   "CPF",
                "number": cpf_limpo,
            },
        },
    }

    try:
        resposta_mp = await asyncio.to_thread(
            sdk.payment().create, payment_data
        )
    except Exception as e:
        print(f"[MP ERROR] Exceção ao chamar SDK: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar pagamento: {str(e)}")

    status_code_mp = resposta_mp.get("status", 0)
    response_body  = resposta_mp.get("response", {})

    print(f"[MP] HTTP Status: {status_code_mp}")
    print(f"[MP] Full Response Body:\n{json.dumps(response_body, indent=2, ensure_ascii=False)}")

    if status_code_mp not in (200, 201):
        erro_str = json.dumps(response_body, ensure_ascii=False)
        raise HTTPException(
            status_code=400,
            detail=f"Erro no Mercado Pago (HTTP {status_code_mp}): {erro_str}",
        )

    # Extrair dados do PIX
    id_pagamento_mp = str(response_body.get("id", ""))
    
    if "point_of_interaction" not in response_body:
        mp_status = response_body.get("status", "desconhecido")
        mp_detail = response_body.get("status_detail", "sem_detalhes")
        print(f"[MP ERROR] 'point_of_interaction' ausente. Status: {mp_status} | Detail: {mp_detail}")
        raise HTTPException(
            status_code=400,
            detail=f"Mercado Pago não retornou o Pix. Status interno: {mp_status} ({mp_detail}). Verifique homologação da conta ou dados enviados."
        )

    pix_info        = response_body.get("point_of_interaction", {}).get("transaction_data", {})
    qr_code         = pix_info.get("qr_code", "")          # Copia e Cola
    qr_code_base64  = pix_info.get("qr_code_base64", "")   # Imagem base64

    if not qr_code:
        mp_status = response_body.get("status", "desconhecido")
        mp_detail = response_body.get("status_detail", "sem_detalhes")
        print(f"[MP ERROR] 'qr_code' ausente no transaction_data. Status: {mp_status} | Detail: {mp_detail}")
        raise HTTPException(
            status_code=400,
            detail=f"Pix gerado sem QR Code. Status interno: {mp_status} ({mp_detail}). Verifique os dados."
        )

    print(f"[MP] ✅ Pagamento criado → ID MP: {id_pagamento_mp}")

    # ── 3. Atualizar ID_Transacao na planilha com o ID real do MP ──────────
    try:
        if id_pagamento_mp and indice_linha:
            sheet.update_cell(indice_linha, 8, id_pagamento_mp)
            print(f"[SHEETS] ✅ ID MP salvo na linha {indice_linha}: {id_pagamento_mp}")
    except Exception as e:
        print(f"[SHEETS WARNING] Não foi possível salvar o ID MP: {e}")

    # ── 4. Retornar ao front-end ────────────────────────────────────────────
    return {
        "sucesso":          True,
        "qr_code":          qr_code,
        "qr_code_base64":   qr_code_base64,
        "id_transacao":     id_pagamento_mp,
        "external_reference": external_reference,
    }


# ---------------------------------------------------------------------------
# Rota: Webhook Mercado Pago
# ---------------------------------------------------------------------------
@app.post("/api/webhook", summary="Webhook de pagamento do Mercado Pago")
async def webhook_mercadopago(request: Request):
    """
    O Mercado Pago envia notificações do tipo 'payment'.
    Fluxo:
    0. Valida assinatura HMAC-SHA256 via header x-signature.
    1. Lê o ID do pagamento da notificação.
    2. Consulta o status via SDK.
    3. Se 'approved', atualiza a planilha para PAGO e envia e-mail.
    """
    # ── 0. Validação da assinatura do Mercado Pago ──────────────────────────
    if WEBHOOK_SECRET_TOKEN:
        x_signature   = request.headers.get("x-signature", "")
        x_request_id  = request.headers.get("x-request-id", "")
        raw_body      = await request.body()

        # Extrai ts e v1 do header x-signature (formato: "ts=...;v1=...")
        ts_value = v1_value = ""
        for parte in x_signature.split(";"):
            parte = parte.strip()
            if parte.startswith("ts="):
                ts_value = parte[3:]
            elif parte.startswith("v1="):
                v1_value = parte[3:]

        # Monta o manifesto conforme documentação do MP
        data_obj_pre = json.loads(raw_body) if raw_body else {}
        data_id = str(data_obj_pre.get("data", {}).get("id", ""))
        manifesto = f"id:{data_id};request-id:{x_request_id};ts:{ts_value};"

        # Calcula HMAC-SHA256
        assinatura_calculada = hmac.new(
            WEBHOOK_SECRET_TOKEN.encode("utf-8"),
            manifesto.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(assinatura_calculada, v1_value):
            print(f"[WEBHOOK] ❌ Assinatura inválida! Calculada: {assinatura_calculada} | Recebida: {v1_value}")
            raise HTTPException(status_code=401, detail="Assinatura do webhook inválida.")

        print(f"[WEBHOOK] ✅ Assinatura válida.")
        body = data_obj_pre
    else:
        body = await request.json()

    print(f"\n{'='*55}")
    print(f"[WEBHOOK] Payload recebido: {json.dumps(body, ensure_ascii=False)}")
    print(f"{'='*55}")

    tipo_notificacao = body.get("type", "")
    action           = body.get("action", "")

    # O MP envia type="payment" para notificações de pagamento
    if tipo_notificacao != "payment" and action not in ("payment.created", "payment.updated"):
        print(f"[WEBHOOK] Ignorado — tipo: {tipo_notificacao!r} | action: {action!r}")
        return {"status": "ignorado"}

    # ID do pagamento pode vir em "data.id" ou "id"
    data_obj    = body.get("data", {})
    id_pagamento = str(data_obj.get("id", "") or body.get("id", ""))

    if not id_pagamento:
        print("[WEBHOOK] ⚠️  ID do pagamento não encontrado no payload.")
        return {"status": "sem_id"}

    print(f"[WEBHOOK] ID do pagamento: {id_pagamento}")

    # ── Consultar status real via SDK ───────────────────────────────────────
    try:
        resposta_mp = await asyncio.to_thread(sdk.payment().get, id_pagamento)
        status_code_mp = resposta_mp.get("status", 0)
        payment_data   = resposta_mp.get("response", {})
    except Exception as e:
        print(f"[WEBHOOK ERROR] Falha ao consultar pagamento {id_pagamento}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao consultar pagamento: {str(e)}")

    status_mp = payment_data.get("status", "")
    print(f"[WEBHOOK] Status Mercado Pago: {status_mp!r}")

    if status_mp != "approved":
        print(f"[WEBHOOK] Pagamento não aprovado ({status_mp}) — sem ação.")
        return {"status": "nao_aprovado", "status_mp": status_mp}

    # ── Localizar registro na planilha pelo ID do pagamento ─────────────────
    try:
        sheet       = _get_sheet()
        todos_dados = sheet.get_all_values()
        cabecalho   = todos_dados[0] if todos_dados else []

        try:
            col_id_transacao = cabecalho.index("ID_Transacao") + 1
            col_status       = cabecalho.index("Status")       + 1
            col_nome         = cabecalho.index("Nome")         + 1
            col_email        = cabecalho.index("Email")        + 1
            col_plano        = cabecalho.index("Plano")        + 1
        except ValueError as ve:
            raise HTTPException(status_code=500, detail=f"Cabeçalho inválido: {ve}")

        linha_final = None
        for i, linha in enumerate(todos_dados[1:], start=2):
            id_na_plan = linha[col_id_transacao - 1] if len(linha) >= col_id_transacao else ""
            if id_na_plan == id_pagamento:
                linha_final = i
                break

        if not linha_final:
            print(f"[WEBHOOK] ⚠️  ID {id_pagamento} não encontrado na planilha.")
            return {"status": "nao_encontrado"}

        # ── Atualiza status para PAGO ───────────────────────────────────────
        sheet.update_cell(linha_final, col_status, "PAGO")
        print(f"[WEBHOOK] ✅ Linha {linha_final} → PAGO")

        # ── Lê dados para o e-mail ──────────────────────────────────────────
        linha_dados = todos_dados[linha_final - 1]

        def _cel(col_idx: int) -> str:
            idx = col_idx - 1
            return linha_dados[idx].strip() if len(linha_dados) > idx else ""

        nome_part  = _cel(col_nome)
        email_part = _cel(col_email)
        plano_part = _cel(col_plano)

        # ── Envia e-mail de confirmação ─────────────────────────────────────
        try:
            await enviar_email_confirmacao(email_part, nome_part, plano_part)
        except Exception as email_err:
            print(f"[EMAIL] ❌ Falha: {email_err}")
            print(traceback.format_exc())

        return {"status": "sucesso", "linha_atualizada": linha_final}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[WEBHOOK ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar webhook: {str(e)}")


# ---------------------------------------------------------------------------
# Rota: Polling de status (consultada pelo front-end)
# ---------------------------------------------------------------------------
@app.get("/api/status-pagamento/{id_transacao}", summary="Consultar status pelo ID")
@app.get("/api/status/{id_transacao}",           summary="Alias — Consultar status")
async def consultar_status(id_transacao: str):
    """
    Front-end faz polling a cada 5 s.
    Ao detectar PAGO pela primeira vez: envia e-mail e marca PAGO_EMAIL_ENVIADO.
    Retorna 'PAGO' ao front-end nos dois casos.
    """
    print(f"[STATUS] Consultando ID: {id_transacao!r}")
    try:
        sheet       = _get_sheet()
        todos_dados = sheet.get_all_values()
        cabecalho   = todos_dados[0] if todos_dados else []

        try:
            col_id_transacao = cabecalho.index("ID_Transacao") + 1
            col_status       = cabecalho.index("Status")       + 1
            col_nome         = cabecalho.index("Nome")         + 1
            col_email        = cabecalho.index("Email")        + 1
            col_plano        = cabecalho.index("Plano")        + 1
        except ValueError as ve:
            raise HTTPException(status_code=500, detail=f"Cabeçalho inválido: {ve}")

        for i, linha in enumerate(todos_dados[1:], start=2):
            id_na_planilha = linha[col_id_transacao - 1] if len(linha) >= col_id_transacao else ""
            if id_na_planilha != id_transacao:
                continue

            status = linha[col_status - 1] if len(linha) >= col_status else "PENDENTE"
            nome   = linha[col_nome - 1]   if len(linha) >= col_nome   else ""
            print(f"[STATUS] Encontrado → Nome: {nome!r} | Status: {status!r}")

            if status == "PENDENTE":
                try:
                    # Fallback: Consulta o MP ativamente caso o webhook atrase ou não chegue
                    resposta_mp = await asyncio.to_thread(sdk.payment().get, id_transacao)
                    status_mp = resposta_mp.get("response", {}).get("status", "")
                    if status_mp == "approved":
                        print(f"[STATUS] ✅ Fallback MP Check: Pagamento {id_transacao} APROVADO! Atualizando planilha.")
                        status = "PAGO"
                        sheet.update_cell(i, col_status, "PAGO")
                except Exception as e:
                    print(f"[STATUS ERROR] Falha no fallback de verificação ativa no MP: {e}")

            if status == "PAGO":
                email_part = linha[col_email - 1] if len(linha) >= col_email else ""
                plano_part = linha[col_plano - 1] if len(linha) >= col_plano else ""

                try:
                    sheet.update_cell(i, col_status, "PAGO_EMAIL_ENVIADO")
                except Exception as mark_err:
                    print(f"[STATUS] Aviso: não marcou PAGO_EMAIL_ENVIADO: {mark_err}")

                try:
                    await enviar_email_confirmacao(email_part, nome, plano_part)
                except Exception as email_err:
                    print(f"[EMAIL] Falha: {email_err}")
                    print(traceback.format_exc())

            status_frontend = "PAGO" if "PAGO" in status else status
            return {"id_transacao": id_transacao, "status": status_frontend, "nome": nome}

        return {"id_transacao": id_transacao, "status": "PENDENTE", "nome": ""}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[STATUS ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao consultar status: {str(e)}")


# ---------------------------------------------------------------------------
# Rota: Testar e-mail
# ---------------------------------------------------------------------------
@app.get("/api/testar-email", summary="Testa envio de e-mail SMTP")
async def testar_email(destino: str = "ufpaspe@gmail.com", plano: str = "EQUIPE"):
    try:
        await enviar_email_confirmacao(destino, "Teste PetroGame", plano)
        return {"status": "ok", "mensagem": f"E-mail enviado para {destino}"}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[TESTAR-EMAIL] ERRO:\n{tb}")
        return {"status": "erro", "detalhe": str(e), "traceback": tb}


# ---------------------------------------------------------------------------
# Health-check
# ---------------------------------------------------------------------------
@app.get("/", summary="Health check")
def home():
    return {"status": "Servidor PetroGame rodando!", "versao": "3.0.0"}