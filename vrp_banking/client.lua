local cfg = module("vrp_banking", "cfg/cfg")

local uiOpen = false
local inBankZone = false
local nearbyBankLabel = nil

local function showNotification(message)
    BeginTextCommandThefeedPost("STRING")
    AddTextComponentSubstringPlayerName(message)
    EndTextCommandThefeedPostTicker(false, false)
end

RegisterNetEvent("vrp_banking:setInBank", function(isInside, data)
    inBankZone = isInside
    nearbyBankLabel = data and data.bank_name or nil

    if not isInside and uiOpen then
        SendNUIMessage({ type = "close" })
        SetNuiFocus(false, false)
        uiOpen = false
    end
end)

RegisterNetEvent("vrp_banking:openUI", function(success, payload, message)
    if not success then
        if message then
            showNotification(message)
        end
        return
    end

    SetNuiFocus(true, true)
    uiOpen = true

    SendNUIMessage({
        type = "open",
        data = payload
    })
end)

RegisterNetEvent("vrp_banking:actionResult", function(action, success, message, payload)
    SendNUIMessage({
        type = "actionResult",
        action = action,
        success = success,
        message = message,
        data = payload
    })
end)

RegisterNetEvent("vrp_banking:updateContext", function(payload)
    SendNUIMessage({
        type = "updateContext",
        data = payload
    })
end)

RegisterNUICallback("bankAction", function(data, cb)
    local action = data and data.action

    if action == "deposit" or action == "withdraw" then
        local amount = tonumber(data.amount)
        if amount and amount > 0 then
            TriggerServerEvent("vrp_banking:" .. action, amount)
        else
            SendNUIMessage({
                type = "actionResult",
                action = action,
                success = false,
                message = "Introduceți o sumă validă."
            })
        end
    elseif action == "createAccount" then
        TriggerServerEvent("vrp_banking:createAccount", data.pin)
    elseif action == "close" then
        uiOpen = false
        SetNuiFocus(false, false)
        SendNUIMessage({ type = "close" })
    end

    cb("ok")
end)

Citizen.CreateThread(function()
    while true do
        local waitTime = 1000

        if inBankZone and not uiOpen then
            waitTime = 0
            if nearbyBankLabel then
                BeginTextCommandDisplayHelp("STRING")
                AddTextComponentSubstringPlayerName("Apasă ~INPUT_CONTEXT~ pentru a accesa banca " .. nearbyBankLabel)
                EndTextCommandDisplayHelp(0, false, true, -1)
            end

            if IsControlJustReleased(0, 38) then -- E key
                TriggerServerEvent("vrp_banking:requestOpen")
            end
        end

        Citizen.Wait(waitTime)
    end
end)

Citizen.CreateThread(function()
    for _, bank in ipairs(cfg.banks or {}) do
        local blip = AddBlipForCoord(bank.bank_entry.x, bank.bank_entry.y, bank.bank_entry.z)
        SetBlipSprite(blip, 108)
        SetBlipScale(blip, 0.85)
        SetBlipColour(blip, 69)
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(bank.bank_name .. " Bank")
        EndTextCommandSetBlipName(blip)
    end
end)
