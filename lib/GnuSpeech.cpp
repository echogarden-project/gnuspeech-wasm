#include <cstring>
#include <exception>
#include <fstream>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>

#include "Controller.h"
#include "Exception.h"
#include "global.h"
#include "Log.h"
#include "Model.h"
#include "en/phonetic_string_parser/PhoneticStringParser.h"
#include "en/text_parser/TextParser.h"
#include "TRMControlModelConfiguration.h"

extern "C" int GnuSpeech_synthesizeToFile(const char* inputText, const char* outputWavFile, const char* configDirPath, const char* trmParamFile, bool enableDebug) {
    if (inputText == nullptr || outputWavFile == nullptr || configDirPath == nullptr || trmParamFile == nullptr) {
        std::cerr << "Error: Null pointer argument provided." << std::endl;

        return 1; // Return an error code
    }

    if (strlen(inputText) == 0) {
        std::cerr << "Error: Empty input text." << std::endl;

        return 1; // Return an error code
    }

    if (enableDebug) {
        GS::Log::debugEnabled = true;
    }

    try {
        std::unique_ptr<GS::TRMControlModel::Model> trmControlModel(new GS::TRMControlModel::Model());
        trmControlModel->load(configDirPath, TRM_CONTROL_MODEL_CONFIG_FILE);

        std::unique_ptr<GS::TRMControlModel::Controller> trmController(new GS::TRMControlModel::Controller(configDirPath, *trmControlModel));
        const GS::TRMControlModel::Configuration& trmControlConfig = trmController->trmControlModelConfiguration();

        std::unique_ptr<GS::En::TextParser> textParser(new GS::En::TextParser(configDirPath,
                                            trmControlConfig.dictionary1File,
                                            trmControlConfig.dictionary2File,
                                            trmControlConfig.dictionary3File));

        std::unique_ptr<GS::En::PhoneticStringParser> phoneticStringParser(new GS::En::PhoneticStringParser(configDirPath, *trmController));

        std::string phoneticString = textParser->parseText(inputText);
        trmController->synthesizePhoneticString(*phoneticStringParser, phoneticString.c_str(), trmParamFile, outputWavFile);
    } catch (std::exception& e) {
        std::cerr << "Caught an exception: " << e.what() << std::endl;
        return 1; // Return an error code
    } catch (...) {
        std::cerr << "Caught an unknown exception." << std::endl;
        return 1; // Return an error code
    }

    return 0; // Success
}
