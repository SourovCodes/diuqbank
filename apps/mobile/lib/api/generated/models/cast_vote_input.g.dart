// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cast_vote_input.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CastVoteInput _$CastVoteInputFromJson(Map<String, dynamic> json) =>
    CastVoteInput(
      value: VoteValue.fromJson(json['value'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CastVoteInputToJson(CastVoteInput instance) =>
    <String, dynamic>{'value': instance.value};
