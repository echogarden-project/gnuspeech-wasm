export const defaultTrmControlModelFileContent = `
# Configuration file for the TRM Control Model.

# Hz
control_rate = 250.0

#
voice_name = male
#voice_name = female
#voice_name = large_child
#voice_name = small_child
#voice_name = baby

#
tempo = 1.0

#
pitch_offset = -4.0

# semitones
drift_deviation = 0.5

# Hz
drift_lowpass_cutoff = 0.5

# 0: disable
# 1: enable
micro_intonation = 1
macro_intonation = 1
#smooth_intonation = 1
intonation_drift = 1
random_intonation = 1

notional_pitch = 2.0
pretonic_range = -2.0
pretonic_lift = 4.0
tonic_range = -8.0
tonic_movement = 4.0

# "none": dictionary disabled
dictionary_1_file = none
dictionary_2_file = none
dictionary_3_file = MainDictionary.txt
`
